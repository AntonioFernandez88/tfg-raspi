var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
	
	var nombre = req.query.nombre || '';

	if(nombre != ''){
		console.log('hola');
		var name = res.cookie('Nombre', req.query.nombre, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		res.redirect('/');
	}else{
  		res.render('index');
  	}
});

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log(req.cookie);
});
//PARA CARGAR LA VISTA
router.get('/vincular', function(req, res, next) {
	
	//Si viene vacio carga la vista normal, si hay datos los guarda el formulario viene por get
	var mac = req.query.mac || '';
	var nserie = req.query.mac || '';
	if ((mac != '') && (nserie != '')){
		var dirmac = res.cookie('Mac', req.query.mac, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
		var numserie = res.cookie('Nserie', req.query.nserie, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	    
	    res.redirect('/');
	}else{res.render('vincular');}
  
});

//PARA CARGAR LA VISTA
router.get('/camara', function(req, res, next) {
  res.render('camara');

});

//PARA CARGAR LA VISTA
router.get('/pruebas', function(req, res, next) {
  res.render('pruebas');

});

//PARA CARGAR LA VISTA
router.get('/qr', function(req, res, next) {
  res.render('qr');

});

module.exports = router;
