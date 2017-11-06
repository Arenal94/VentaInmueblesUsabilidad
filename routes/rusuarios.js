
module.exports = function(app, swig, gestorBD) {

	app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/bidentificacion.html', {});
		res.send(respuesta);
	});
	app.get("/acercade", function(req, res) {
		var respuesta = swig.renderFile('views/bacercade.html', {});
		res.send(respuesta);
	});
	app.get("/contacto", function(req, res) {
		var respuesta = swig.renderFile('views/bcontacto.html', {
			vendedor :	req.query.vendedor,
			userReq : req.session.usuario
		});
		res.send(respuesta);
	});

	app.get("/contacta", function(req, res) {
		var respuesta = swig.renderFile('views/bcontacta.html', {
			vendedor :	req.query.vendedor,
			userReq : req.session.usuario
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
			to: [mensaje.emailReceptor],
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
				if(req.session.bounceTo)
					res.redirect(req.session.bounceTo);
				else
					res.redirect("/inmuebles");
			}

		});
	});

	app.get("/registrarse", function(req, res) {
		var respuesta = swig.renderFile('views/bregistro.html', {});
		res.send(respuesta);
	});

	app.get("/usuario/perfil", function(req, res) {
		var criterio = {
            email : req.session.usuario
		};
		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null) {
                return res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bperfil.html', {
					usuario : usuarios[0],
					userReq : req.session.usuario
                });
                return res.send(respuesta);
            }
        });
	});
	app.post('/usuario/modificar', function(req, res) {
		
		var criterio = {
			email : req.session.usuario
		}
		var usuario = {
			nombre : req.body.nombre,
			apellidos :  req.body.apellidos
		}
		gestorBD.modificarUsuario(criterio, usuario, function(id) {
			if (id == null){
				res.redirect("/usuario/perfil?mensaje=Error al modificar usuario")
			} else {
				res.redirect("/usuario/perfil?mensaje=Datos de usuario modificados");
			}
		});
	}),

	app.post('/usuario', function(req, res) {
		
	    var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
	    	.update(req.body.password).digest('hex');

		var usuario = {
			email : req.body.email,
			password : seguro,
			nombre : req.body.nombre,
			apellidos :  req.body.apellidos
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
	    res.redirect("/identificarse");
	})


};
