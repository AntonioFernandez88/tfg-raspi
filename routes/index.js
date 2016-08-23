var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');
var macaddress = require('macaddress');
var macSrc;

//GET MY MAC ADDRESS
macaddress.one(function (err, mac) {
	console.log("Mac address for this host: %s", mac); 
	macSrc = mac; 
});

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
	var macDst = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var cookieDirMac = [];
	var hmac = crypto.createHmac('sha1', macDst);
	var msg;

	if(nameCookie != ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}

	if((macDst != '') && (nserial != '')){
		
		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		cookieDirMac[nserial]={mac:macDst, nserial:nserial};
		hmac.update(nameCookie);
		var hmacHash = hmac.digest('hex');
		//var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/link?name='+nameCookie+'&mac='+mac+'&nserial='+nserial+'", "hmac" : "'+hmacHash+'"}';
		msg = '{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/link", "hmac" : "'+hmacHash+'"}';
		console.log(msg);
		myEmitter.emit('eventHmac', msg);
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
	var macDst = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var hex = req.query.hex || '';
	var rgb; 
	var msg;

	if(led != ''){
		if(led == 'on'){
			msg = '{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/led/on"}';
			myEmitter.emit('eventLed', msg);
			/*myEmitter.on('eventACK', function(msg){
        	res.render('led',{option: 'Led On'});
    		});*/
			
		}else if(led === 'off'){
			msg = '{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/led/off"}';
			myEmitter.emit('eventLed', msg);
			res.render('led',{option: 'Led Off'});
		}else if(led === 'blink'){
			msg ='{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/led/blink"}';
			myEmitter.emit('eventLed', msg);
			res.render('led',{option: 'Led Parpadeando'});
		}else if(led === 'Cambiar color'){
			if(hex == ''){
				res.render('led',{option: 'Introduzca un color, por favor'});
			}else{
				rgb = hexRgb(hex);
				msg ='{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/led/rgb", "color" : "'+rgb+'"}';
				console.log(msg);
				myEmitter.emit('eventLed', msg);
				res.render('led',{option: 'Color Cambiado'});
			}
		}
	}else{
		res.render('led',{option: ''});
	}
});

//TEXT
router.get('/text', function(req, res, next){

	var text = req.query.text || '';
	var comment = req.query.comment || '';
	var macDst = req.query.mac || '';
	var msg;

	if(text != ''){
		if(comment == ''){
			res.render('text',{comment: 'Escribe un comentario, por favor.'});
		}else{
			msg ='{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/led/write", "text" : "'+comment+'"}';
			myEmitter.emit('eventWriteLcd', msg);
			res.render('text',{comment: 'Mensaje Enviado!'});
		}
	}else{
		res.render('text',{comment: ''});
	}
});

//BUZZER
router.get('/buzzer', function(req, res, next){

	var buzzer = req.query.buzzer || '';
	var macDst = req.query.mac || '';
	var msg;

	if(buzzer != ''){
		if(buzzer == 'on'){
			msg = '{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/buzzer/on"}';
			myEmitter.emit('eventBuzzer', msg);
			res.render('buzzer',{sound: 'Alarma encendida'});
		}else if(buzzer === 'off'){
			msg = '{"src" : "'+macSrc+'", "dst" : "'+macDst+'", "path" : "/buzzer/off"}';
			myEmitter.emit('eventBuzzer', msg);
			res.render('buzzer',{sound: 'Alarma apagada'});
		}
	}else{
		res.render('buzzer', {sound: ''});
	}
});

//TEMPERATURE
router.get('/temperature', function(req, res, next){

	res.render('temperature', {temperature: ''});
});


module.exports = router;
