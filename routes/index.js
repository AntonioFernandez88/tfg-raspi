var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');
var msg;
var ack = false;
var cont = 0;

function checkPi(req, res)
{
    checkUser(req, res);

    if (req.query.id === undefined || req.cookies.pi === undefined) {
        res.redirect('/');
    }

    try {
        cookieDirMac = JSON.parse(req.cookies.pi);
        if (cookieDirMac[req.query.id] === undefined) {
            res.redirect('/');
        }
    } catch(e) {
		res.redirect('/');
    }
}

function checkUser(req, res)
{
    if (req.cookies.name === undefined) {
        res.redirect('/');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {

    if (req.cookies.name !== undefined) {
		res.redirect('/configuration');
		return;
	}

	var nameCookie = req.query.name || '';

	if(nameCookie !== ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/configuration');
		//res.redirect('/');
	}else{
		res.render('index');
	}
	//res.render('index');
});

//LOAD TO VIEW
router.get('/link', function(req, res, next) {
    checkUser(req, res);

	//Si viene vacio carga la vista normal, si hay datos los guarda el formulario viene por get
	var nameCookie = req.query.name || '';
	var mac = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var id = req.query.id || '';
	var cookieDirMac = [];
	var hmac = crypto.createHmac('sha1', nserial);
	msg;

	/*if(nameCookie != ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}*/

	if((mac != '') && (nserial != '') && (id != '')){

		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		cookieDirMac[id]={mac:mac, nserial:nserial, id:id};
		hmac.update(mac);
		var hmacHash = hmac.digest('hex');
		msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/ack_auth", "query" : null }';
		console.log(msg);
		myEmitter.emit('eventHmac', msg);
		//Enviamos la hmac y la id para enviar el mensaje a esa persona
		myEmitter.emit('eventHmacAndId', hmacHash, id);
		res.cookie('pi', JSON.stringify(cookieDirMac), {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.render('configuration', {link : 'Raspberry vinculada'});
	}else{res.render('link');}

});

//ACTIONS
router.get('/actions', function(req, res, next) {
    checkPi(req, res);

	res.render('actions', {id: req.query.id});

});

//CONFIGURATION
router.get('/configuration', function(req, res, next) {

    checkUser(req, res);
		res.render('configuration', {link : ''});
});

//LED
router.get('/led', function(req, res, next){

    checkPi(req, res);

	var led = req.query.option || '';
	var mac = req.query.mac || '';
	var id = req.query.id || '';
	msg;
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');
	//Enviamos la hmac y la id para enviar el mensaje a esa persona
	myEmitter.emit('eventHmacAndId', hmacHash, id);
	console.log(msg);

	if(led != ''){
		if(led === 'on'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/on", "query" : null }';
			myEmitter.emit('eventLed', msg);
			myEmitter.on('ACKLedOn', function(msg){
				ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusLed', 'off');
					res.render('led',{option: 'Led On'});
					ack = false
				}else{
					res.render('led',{option: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(led === 'off'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/off", "query" : null }';
			myEmitter.emit('eventLed', msg);
			myEmitter.on('ACKLedOff', function(msg){
    			ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusLed', 'on');
					res.render('led',{option: 'Led Off'});
					ack = false
				}else{
					res.render('led',{option: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(led === 'blink'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/blink", "query" : null }';
			myEmitter.emit('eventLed', msg);
			myEmitter.on('ACKLedBlink', function(msg){
				ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});

			setTimeout(function(){
				if(ack === true){
					res.render('led',{option: 'Led Parpadeando'});
				}else{
					res.render('led',{option: 'Error, pruebe de nuevo'});
				}
			},1000);
		}
	}else{
		res.render('led',{option: ''});
	}
});

//TEXT
router.get('/lcd', function(req, res, next){
    checkPi(req, res);

	var text = req.query.text || '';
	var comment = req.query.comment || '';
	var id = req.query.id || '';
	var mac = req.query.mac || '';
	var option = req.query.option || '';
	msg;
	var hex = req.query.hex || '';
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');
	//Enviamos la hmac y la id para enviar el mensaje a esa persona
	myEmitter.emit('eventHmacAndId', hmacHash, id);
	console.log(msg);

	if(text !== ''){
		if(comment === ''){
			res.render('lcd',{comment: 'Escribe un comentario, por favor', option: ''});
		}else{
			comment = comment.replace(/(\n|\n\r|\r\n)/,"");
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/lcd/write", "query" : "'+comment+'" }';
			myEmitter.emit('eventWriteLcd', msg);

			myEmitter.on('ACKLcdWriteOk', function(msg){
				ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.render('lcd',{comment: 'Mensaje Enviado!', option: ''});
					ack = false
				}else{
					res.render('lcd',{comment: 'Error, pruebe de nuevo', option: ''});
			}
			},1000);
		}
	}else if(option === 'Cambiar color'){
			if(hex == ''){
				res.render('lcd',{comment: '', option: 'Introduzca un color, por favor'});
			}else{
				rgb = hexRgb(hex);
				msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/lcd/rgb", "query" : "'+rgb+'" }';
				console.log(msg);
				myEmitter.emit('eventLed', msg);

				myEmitter.on('ACKLcdRgbOk', function(msg){
				ack = true;
				});

				myEmitter.on('ACKError', function(msg){
	    			ack = false;
				});
				setTimeout(function(){
					if(ack === true){
						res.render('lcd',{comment: '', option: 'Color Cambiado'});
						ack = false
					}else{
						res.render('lcd',{comment: '', option:'Error, pruebe de nuevo'});
					}
				},1000);
			}
	}else{
	res.render('lcd',{comment: '', option: ''});
	}
});

//BUZZER
router.get('/buzzer', function(req, res, next){
    checkPi(req, res);

	var buzzer = req.query.buzzer || '';
	var id = req.query.id || '';
	var mac = req.query.mac || '';
	msg;
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');
	//Enviamos la hmac y la id para enviar el mensaje a esa persona
	myEmitter.emit('eventHmacAndId', hmacHash, id);
	console.log(msg);

	if(buzzer != ''){
		if(buzzer === 'on'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/buzzer/on", "query" : null }';
			myEmitter.emit('eventBuzzer', msg);
			myEmitter.on('ACKBuzzerOn', function(msg){
    			ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusBuzzer', 'on');
					res.render('buzzer',{sound: 'Alarma encendida'});
					ack = false
				}else{
					res.render('buzzer',{sound: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(buzzer === 'off'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/buzzer/off", "query" : null }';
			myEmitter.emit('eventBuzzer', msg);
			myEmitter.on('ACKBuzzerOff', function(msg){
    			ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusBuzzer', 'off');
					res.render('buzzer',{sound: 'Alarma apagada'});
					ack = false
				}else{
					res.render('buzzer',{sound: 'Error, pruebe de nuevo'});
				}
			},1000);
		}
	}else{
		res.render('buzzer', {sound: ''});
	}
});

//TEMPERATURE
router.get('/temperature', function(req, res, next){
	checkPi(req, res);

	var temp = req.query.temp || '';
	var id = req.query.id || '';
	var mac = req.query.mac || '';
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');
	//Enviamos la hmac y la id para enviar el mensaje a esa persona
	myEmitter.emit('eventHmacAndId', hmacHash, id);
	console.log(msg);

    if(temp !== ''){
		if(temp === 'on'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/temp/on", "query" : null }';
			myEmitter.emit('eventTemp', msg);
			myEmitter.on('ACKTempStart', function(msg){
    			ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusTemp', 'on');
					res.render('temperature',{temp: 'Tomando temperatura'});
					ack = false
				}else{
					res.render('temperature',{temp: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(temp === 'off'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/temp/off", "query" : null }';
			myEmitter.emit('eventTemp', msg);

			myEmitter.on('ACKTempStop', function(msg){
    			ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.cookie('statusTemp', 'off');
					res.render('temperature',{temp: 'Parado'});
					ack = false
				}else{
					res.render('temperature',{temp: 'Error, pruebe de nuevo'});
				}
			},1000);
		}
    }else{
		res.render('temperature', {temp: ''});
	}
});

module.exports = router;
