var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log(req.cookie);
});
//PARA CARGAR LA VISTA
router.get('/vincular', function(req, res, next) {
  res.render('vincular');

});

//PARA RECOGER LOS DATOS Y REDIRIGIR
router.post('/vincular', function(req, res) {
	var name = res.cookie('Nombre', req.body.nombre, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	var dirmac = res.cookie('Mac', req.body.mac, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
	var numserie = res.cookie('Nserie', req.body.nserie, {expires: new Date(Date.now() + (3600 * 1000 * 24 * 365))});
    
    res.redirect('/');
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
