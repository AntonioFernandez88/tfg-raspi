var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');
var macaddress = require('macaddress');
var macSrc;

/*//GET MY MAC ADDRESS
macaddress.one(function (err, mac) {
	console.log("Mac address for this host: %s", mac); 
	macSrc = mac; 
});*/

/* GET home page. */
router.get('/', function(req, res, next) {
	
	var nameCookie = req.query.name || '';

	/*if(nameCookie != ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{
		res.render('index');
	}*/
	res.render('index');
});

//LOAD TO VIEW
router.get('/link', function(req, res, next) {
	
	//Si viene vacio carga la vista normal, si hay datos los guarda el formulario viene por get
	var nameCookie = req.query.name || '';
	var mac = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var id = req.query.id || '';
	var cookieDirMac = [];
	var hmac = crypto.createHmac('sha1', mac);
	var msg;

	if(nameCookie != ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}

	if((mac != '') && (nserial != '') && (id != '')){
		
		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		cookieDirMac[id]={mac:mac, nserial:nserial, id:id};
		hmac.update(id);
		var hmacHash = hmac.digest('hex');
		msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/link", "query" : null }';
		console.log(msg);
		myEmitter.emit('eventHmac', msg);
		//Enviamos la hmac y la id para enviar el mensaje a esa persona
		myEmitter.emit('eventHmacAndId', hmacHash, id);
		res.cookie('pi', JSON.stringify(cookieDirMac), {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{res.render('link');}

});

//ACTIONS
router.get('/actions', function(req, res, next) {

	res.render('actions');

});

//CONFIGURATION
router.get('/configuration', function(req, res, next) {

	res.render('configuration');

});

//LED
router.get('/led', function(req, res, next){

	var led = req.query.option || '';
	var mac = req.query.mac || '';
	var id = req.query.id || '';
	var hex = req.query.hex || '';
	var rgb; 
	var msg;
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');

	if(led != ''){
		if(led === 'on'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/on", "query" : "null"}';
			myEmitter.emit('eventLed', msg);
			/*myEmitter.on('eventACK', function(msg){
        	res.render('led',{option: 'Led On'});
    		});*/
    		res.render('led',{option: 'Led On'});
			
		}else if(led === 'off'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/off", "query" : "null"}';
			myEmitter.emit('eventLed', msg);
			res.render('led',{option: 'Led Off'});
		}else if(led === 'blink'){
			msg = '{"hmac" : "'+hmacHash+'", "id" : "'+id+'", "path" : "/led/blink", "query" : "null"}';
			myEmitter.emit('eventLed', msg);
			res.render('led',{option: 'Led Parpadeando'});
		}else if(led === 'Cambiar color'){
			if(hex == ''){
				res.render('led',{option: 'Introduzca un color, por favor'});
			}else{
				rgb = hexRgb(hex);
				msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/on", "query" : "'+rgb+'"}';
				console.log(msg);
				myEmitter.emit('eventLed', msg);
				res.render('led',{option: 'Color Cambiado'});
			}
		}
		//Enviamos la hmac y la id para enviar el mensaje a esa persona
		myEmitter.emit('eventHmacAndId', hmacHash, id);
		console.log(msg);
	}else{
		res.render('led',{option: ''});
	}
});

//TEXT
router.get('/text', function(req, res, next){

	var text = req.query.text || '';
	var comment = req.query.comment || '';
	var id = req.query.id || '';
	var mac = req.query.mac || '';
	var msg;
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');

	if(text != ''){
		if(comment === ''){
			res.render('text',{comment: 'Escribe un comentario, por favor.'});
		}else{
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/led/write", "query" : "'+comment+'"}';
			myEmitter.emit('eventWriteLcd', msg);
			res.render('text',{comment: 'Mensaje Enviado!'});
		}
		//Enviamos la hmac y la id para enviar el mensaje a esa persona
		myEmitter.emit('eventHmacAndId', hmacHash, id);
		console.log(msg);
	}else{
		res.render('text',{comment: ''});
	}
});

//BUZZER
router.get('/buzzer', function(req, res, next){

	var buzzer = req.query.buzzer || '';
	var id = req.query.id || '';
	var mac = req.query.mac || '';
	var msg;
	var hmac = crypto.createHmac('sha1', mac);
	hmac.update(id);
	var hmacHash = hmac.digest('hex');

	if(buzzer != ''){
		if(buzzer === 'on'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/buzzer/on", "query" : "null"}';
			myEmitter.emit('eventBuzzer', msg);
			res.render('buzzer',{sound: 'Alarma encendida'});
		}else if(buzzer === 'off'){
			msg = '{"hmac" : "'+hmacHash+'", "key" : "'+id+'", "path" : "/buzzer/off", "query" : "null"}';
			myEmitter.emit('eventBuzzer', msg);
			res.render('buzzer',{sound: 'Alarma apagada'});
		}
		//Enviamos la hmac y la id para enviar el mensaje a esa persona
		myEmitter.emit('eventHmacAndId', hmacHash, id);
		console.log(msg);
	}else{
		res.render('buzzer', {sound: ''});
	}
});

//TEMPERATURE
router.get('/temperature', function(req, res, next){

	res.render('temperature', {temperature: ''});
});


module.exports = router;
