var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');
var pre_msg;
var msg;
var ack = false;
var jsdom=require('jsdom').jsdom;
var document = jsdom("hello world");
var window = document.defaultView;
var jquery = require('jquery')(window);

/* CHECK PI*/
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

/* CHECK USER*/
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
	}else{
		res.render('index');
	}
});

//LINK
router.get('/link', function(req, res, next) {

    checkUser(req, res);

	var nameCookie = req.query.name || '';
	var mac = req.query.mac || '';
	var id = req.query.id || '';
	var cookieDirMac = [];

	//SEND hmac AND id TO app.js
	myEmitter.emit('eventId', id);

	if((mac != '') && (key != '') && (id != '')){

		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		//msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/ack_auth", "query" : null }';
		cookieDirMac[id]={mac:mac, key:key, id:id};
		console.log(msg);
		//myEmitter.emit('eventHmac', msg);
		res.cookie('pi', JSON.stringify(cookieDirMac), {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.render('configuration', {link : 'Raspberry vinculada'});
	}else{res.render('link');}

});

//ACTIONS
router.get('/actions', function(req, res, next) {
    checkPi(req, res);

    var cookiePi =JSON.parse(req.cookies.pi);
    var message;
	jquery.each(cookiePi, function(id,value) {

		if(id === req.query.id){

			pre_msg = '{"id" : "'+id+'", "path" : "/status/sensors", "query" : null }';
			var hmac = crypto.createHmac('sha1', value.id);
			hmac.update(pre_msg);
			var hmacHash = hmac.digest('hex');
			//SEND id TO app.js
			myEmitter.emit('eventId', id);
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/status/sensors", "query" : null }';
			myEmitter.emit('eventStatusSensor', msg);

			myEmitter.on('ACKStatusSensorsOk', function(msg){
				ack = true;
				message = msg;
			});

			myEmitter.on('ACKError', function(msg){
				ack = false;
			});

			setTimeout(function(){
				if(ack === true){
					ack = false;
					console.log(message.query.split(','));
					res.render('actions', {id: req.query.id, sensor : message.query.split(',')});
				}else{
					res.render('actions', {id: req.query.id, sensor : ['disabled','disabled','disabled','disabled']});
				}
			},1000);
		}
	});

});

//CONFIGURATION
router.get('/configuration', function(req, res, next) {

    checkUser(req, res);
    //SEND hmac AND id TO app.js
	myEmitter.emit('eventId', req.query.id);
	res.render('configuration', {link : ''});
});

//LED
router.get('/led', function(req, res, next){

    checkPi(req, res);

	var led = req.query.option || '';
	var mac = req.query.mac || '';
	var id = req.query.id || '';
	var hmac;
	var hmacHash;

	if(led != ''){
		//SEND hmac AND id TO app.js
		myEmitter.emit('eventId', id);
		console.log('envioooooooooooooooooooooooooooo '+id);
		if(led === 'on'){
			pre_msg = '{"id" : "'+id+'", "path" : "/led/on", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/led/on", "query" : null }';
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
					res.render('led',{option: 'Led encendido'});
					ack = false
				}else{
					res.render('led',{option: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(led === 'off'){
			pre_msg = '{"id" : "'+id+'", "path" : "/led/off", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/led/off", "query" : null }';
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
					res.render('led',{option: 'Led apagado'});
					ack = false
				}else{
					res.render('led',{option: 'Error, pruebe de nuevo'});
				}
			},1000);
		}else if(led === 'blink'){
			pre_msg = '{"id" : "'+id+'", "path" : "/led/blink", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/led/blink", "query" : null }';
			myEmitter.emit('eventLed', msg);
			myEmitter.on('ACKLedBlink', function(msg){
				ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});

			setTimeout(function(){
				if(ack === true){
					res.render('led',{option: 'Led parpadeando'});
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
	var hex = req.query.hex || '';
	var hmac;
	var hmacHash;


	//SEND hmac AND id TO app.js
	myEmitter.emit('eventId', id);
	console.log('envioooooooooooooooooooooooooooo '+id);

	if(text !== ''){
		if(comment === ''){
			res.render('lcd',{comment: 'Escribe un comentario, por favor', option: ''});
		}else{
			comment = comment.replace(/(\n|\n\r|\r\n)/,"");
			pre_msg = '{"id" : "'+id+'", "path" : "/lcd/write", "query" : "'+comment+'" }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/lcd/write", "query" : "'+comment+'" }';
			myEmitter.emit('eventWriteLcd', msg);

			myEmitter.on('ACKLcdWriteOk', function(msg){
				ack = true;
			});

			myEmitter.on('ACKError', function(msg){
    			ack = false;
			});
			setTimeout(function(){
				if(ack === true){
					res.render('lcd',{comment: 'Mensaje enviado!', option: ''});
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
				pre_msg = '{"id" : "'+id+'", "path" : "/lcd/rgb", "query" : "'+rgb+'" }';
				hmac = crypto.createHmac('sha1', id);
				hmac.update(pre_msg);
				var rgb = hexRgb(hex);
				msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/lcd/rgb", "query" : "'+rgb+'" }';
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
						res.render('lcd',{comment: '', option: 'Color cambiado'});
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
	var hmac;
	var hmacHash;

	//SEND hmac AND id TO app.js
	myEmitter.emit('eventId', id);
	console.log('envioooooooooooooooooooooooooooo '+id);

	if(buzzer != ''){
		if(buzzer === 'on'){
			pre_msg = '{"id" : "'+id+'", "path" : "/buzzer/on", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/buzzer/on", "query" : null }';
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
			pre_msg = '{"id" : "'+id+'", "path" : "/buzzer/off", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/buzzer/off", "query" : null }';
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
	var hmac;
	var hmacHash;

	//SEND hmac AND id TO app.js
	myEmitter.emit('eventId', id);
	console.log(msg);

    if(temp !== ''){
		if(temp === 'on'){
			pre_msg = '{"id" : "'+id+'", "path" : "/temp/on", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/temp/on", "query" : null }';
			myEmitter.emit('eventTemp', msg);
			res.cookie('statusTemp', 'on');
			res.render('temperature');
		}else if(temp === 'off'){
			pre_msg = '{"id" : "'+id+'", "path" : "/temp/off", "query" : null }';
			hmac = crypto.createHmac('sha1', id);
			hmac.update(pre_msg);
			hmacHash = hmac.digest('hex');
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/temp/off", "query" : null }';
			myEmitter.emit('eventTemp', msg);
			res.cookie('statusTemp', 'off');
			res.render('temperature');
		}
    }else{
		res.render('temperature');
	}
});

//INFO
router.get('/info', function(req, res, next) {

	res.render('info');
});

module.exports = router;
