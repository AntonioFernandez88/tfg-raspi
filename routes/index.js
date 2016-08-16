var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');

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

//PARA CARGAR LA VISTA
router.get('/link', function(req, res, next) {
	
	//Si viene vacio carga la vista normal, si hay datos los guarda el formulario viene por get
	var nameCookie = req.query.name || '';
	var mac = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var cookieDirMac = [];
	var hmac = crypto.createHmac('sha1', mac);
	var msg;

	if(nameCookie != ''){
		var name = res.cookie('name', req.query.name, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}

	if((mac != '') && (nserial != '')){
		
		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		cookieDirMac[nserial]={mac:mac, nserial:nserial};
		
		hmac.update(nameCookie);
		var hmacHash = hmac.digest('hex');
		//var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/link?name='+nameCookie+'&mac='+mac+'&nserial='+nserial+'", "hmac" : "'+hmacHash+'"}';
		var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/link", "hmac" : "'+hmacHash+'"}';
		console.log(msg);
		myEmitter.emit('hmac', msg);
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

	var led = req.query.opcion || '';
	var mac = req.query.mac || '';
	var nserial = req.query.nserial || '';
	var hex = req.query.hex || '';

	if(led != ''){
		if(led == 'on'){
			console.log(mac);
			var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/led/on"}';
			console.log(msg);
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led On'});
		}else if(led === 'off'){
			var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/led/off"}';
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led Off'});
		}else if(led === 'blink'){
			var msg ='{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/led/blink"}';
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led Parpadeando'});
		}else if(led === 'Cambiar color'){
			if(hex == ''){
				res.render('led',{opcion: 'Introduzca un color'});
			}else{
				var rgb = hexRgb(hex);
				var msg ='{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/led/rgb", "color" : "'+rgb+'"}';
				console.log(msg);
				myEmitter.emit('event', msg);
				res.render('led',{opcion: 'Color Cambiado'});
			}
		}
	}else{
		res.render('led',{opcion: ''});
	}
});

module.exports = router;
