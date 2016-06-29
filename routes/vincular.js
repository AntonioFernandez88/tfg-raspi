var express = require('express');
var router = express.Router();

router.get('/vincular', function(req, res, next){
	res.render('vincular');
});

module.exports = router;