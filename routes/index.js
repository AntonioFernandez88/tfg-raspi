var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/vincular', function(req, res, next) {
  res.render('vincular');

  req.query.nombre;
  req.query.mac;

});

module.exports = router;
