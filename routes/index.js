var express = require('express');
var router = express.Router();
var crypto =  require('crypto');
var hexRgb = require('hex-rgb');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	var nombre = req.query.nombre || '';

	/*if(nombre != ''){
		var name = res.cookie('Nombre', req.query.nombre, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{
		res.render('index');
	}*/
	res.render('index');
});

/* GET home page. */
router.post('/', function(req, res, next) {
	console.log(req.cookies);
});

//PARA CARGAR LA VISTA
router.get('/vincular', function(req, res, next) {
	
	//Si viene vacio carga la vista normal, si hay datos los guarda el formulario viene por get
	var nombre = req.query.nombre || '';
	var mac = req.query.mac || '';
	var nserie = req.query.nserie || '';
	var cookieDirMac = [];
	var hmac = crypto.createHmac('sha1', mac);
	var msg;

	if(nombre != ''){
		var name = res.cookie('Nombre', req.query.nombre, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}

	if((mac != '') && (nserie != '')){
		
		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			cookieDirMac = {};
		}
		cookieDirMac[nserie]={mac:mac, nserie:nserie};
		
		hmac.update(nombre);
		var hmacHash = hmac.digest('hex');
		//var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/vincular?nombre='+nombre+'&mac='+mac+'&nserie='+nserie+'", "hmac" : "'+hmacHash+'"}';
		var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/vincular", "hmac" : "'+hmacHash+'"}';
		console.log(msg);
		myEmitter.emit('hmac', msg);
		res.cookie('pi', JSON.stringify(cookieDirMac), {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{res.render('vincular');}

});

//ACCIONES
router.get('/acciones', function(req, res, next) {

	res.render('acciones');

});

//Configuracion
router.get('/configuracion', function(req, res, next) {

	res.render('configuracion');

});

//Led
router.get('/led', function(req, res, next){

	var led = req.query.opcion || '';
	var mac = req.query.mac || '';
	var nserie = req.query.nserie || '';
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
			var rgb = hexRgb(hex);
			var msg ='{"src" : "D4:B2:54:E2:24:2D", "dst" : "'+mac+'", "path" : "/led/rgb", "color" : "'+rgb+'"}';
			console.log(msg);
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led Parpadeando'});
		}
	}else{
		res.render('led',{opcion: ''});
	}
});

module.exports = router;
