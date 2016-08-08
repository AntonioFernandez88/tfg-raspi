var express = require('express');
var router = express.Router();


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

	if(nombre != ''){
		var name = res.cookie('Nombre', req.query.nombre, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	}

	if((mac != '') && (nserie != '')){
		
		try{
			cookieDirMac = JSON.parse(req.cookies.pi);
		}catch(e){
			console.log(e);
			cookieDirMac = {};
		}
		cookieDirMac[nserie]={mac:mac, nserie:nserie};
		res.cookie('pi', JSON.stringify(cookieDirMac), {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{res.render('vincular');}

});

//ACCIONES
router.get('/acciones', function(req, res, next) {
	cookieDirMac = JSON.parse(req.cookies.pi);
	res.render('acciones', {cookies: cookieDirMac});
});

//WEBSOCKET
router.get('/led', function(req, res, next){

	var led = req.query.opcion || '';
	if(led != ''){
		if(led == 'on'){
			var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "80:C1:45:A5:1B:7F", "path" : "/led/on"}';
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led On'});
		}else if(led === 'off'){

			var msg = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "80:C1:45:A5:1B:7F", "path" : "/led/off"}';
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led Off'});
		}else if(led === 'blink'){

			var msg ='{"src" : "D4:B2:54:E2:24:2D", "dst" : "80:C1:45:A5:1B:7F", "path" : "/led/blink"}';
			myEmitter.emit('event', msg);
			res.render('led',{opcion: 'Led Parpadeando'});
		}
	}else{
		res.render('led');
	}
});

module.exports = router;
