
module.exports = function(app, swig, gestorBD) {

	app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/bidentificacion.html', {});
		res.send(respuesta);
	});
	app.get("/contacto", function(req, res) {
		var respuesta = swig.renderFile('views/bcontacto.html', {
			vendedor :	req.query.vendedor
		});
		res.send(respuesta);
	});

	app.post("/email", function(req, res) {
	var mensaje = {
		emailEmisor: req.body.email,
		emailReceptor: req.query.vendedor,
		nombreEmisor: req.body.name,
		cuerpo: req.body.mensaje,
	}
		app.mailer.send('email', {
			to: [mensaje.emailReceptor], // REQUIRED. This can be a comma delimited string just like a normal email to field.  
			subject: 'Un posible comprador quiere ponerse en contacto', // REQUIRED. 
			message: mensaje.cuerpo ,
			emailEmisor: mensaje.emailEmisor,
			nombreEmisor: mensaje.nombreEmisor,
		}, function (err) {
			if (err) {
			res.send('There was an error sending the email');
			return;
			}
			res.redirect("/inmuebles");
		});
	});
	app.post("/identificarse", function(req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
				.update(req.body.password).digest('hex');

		var criterio = {
			email : req.body.email,
			password : seguro
		}

		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				req.session.usuario = null;
				res.redirect("/identificarse" +
						"?mensaje=Email o password incorrecto"+
						"&tipoMensaje=alert-danger ");

			} else {
				req.session.usuario = usuarios[0].email;
				res.redirect("/inmuebles");

			}

		});
	});

	app.get("/registrarse", function(req, res) {
		var respuesta = swig.renderFile('views/bregistro.html', {});
		res.send(respuesta);
	});
	app.post('/usuario', function(req, res) {
		
	    var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
	    	.update(req.body.password).digest('hex');

		var usuario = {
			email : req.body.email,
			password : seguro
		}
		gestorBD.insertarUsuario(usuario, function(id) {
			if (id == null){
				res.redirect("/registrarse?mensaje=Error al registrar usuario")
			} else {
				res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
			}
		});
	})
	app.get('/desconectarse', function (req, res) {
	    req.session.usuario = null;
	    res.send("Usuario desconectado");
	})


};
