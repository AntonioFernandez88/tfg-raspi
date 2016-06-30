//GET /vincular
exports.new = function (req,res){

	var nombre = req.body.nombre;
	console.log(nombre);

	var mac = req.body.mac;
	console.log(mac);

	var nserie = req.body.nserie;
	console.log(nserie);
};

