module.exports = function(app, swig, gestorBD) {
    
    app.get("/inmuebles", function(req, res) {
		var criterio = {};
		if (req.query.busqueda != null) {
			criterio = {
				"nombre" : {
					$regex : ".*" + req.query.busqueda + ".*"
				}
			};
		}
		var pg = parseInt(req.query.pg); // Es String !!!
		if ( req.query.pg == null){ // Puede no venir el param
			pg = 1;
		}
    app.get('/inmueble/:id', function(req, res) {
            var criterio = {
                "_id" : gestorBD.mongo.ObjectID(req.params.id)
            };
    
            gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                if (inmuebles == null) {
                    res.send(respuesta);
                } else {
                    var respuesta = swig.renderFile('views/binmueble.html', {
                        inmueble : inmuebles[0]
                    });
                    res.send(respuesta);
                }
        });
    })

		gestorBD.obtenerInmueblesPg(criterio, pg , function(inmuebles, total ) {
			if (inmuebles == null) {
				res.send("Error al listar ");
			} else {
				
				var ultimaPg = total/4;
				if (total % 4 > 0 ){ // Sobran decimales
					ultimaPg = ultimaPg+1;
				}
				
				var paginas = []; // paginas mostrar
				for(var i = pg-2 ; i <= pg+2 ; i++){
					if ( i > 0 && i <= ultimaPg){
						paginas.push(i);
					}
				}
				var respuesta = swig.renderFile('views/blistaInmuebles.html', 
				{
					inmuebles : inmuebles,
					paginas : paginas,
					actual : pg
				});
				res.send(respuesta);
			}
		});

	});
        app.get('/inmuebles/agregar', function(req, res) {
            var respuesta = swig.renderFile('views/bagregar.html', {
    
            });
            res.send(respuesta);
        })
        app.get("/misinmuebles", function(req, res) {
            var criterio = {
                vendedor : req.session.usuario
            };
    
            gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                if (inmuebles == null) {
                    res.send("Error al listar ");
                } else {
                    var respuesta = swig.renderFile('views/bmisinmuebles.html', {
                        inmuebles : inmuebles
                    });
                    res.send(respuesta);
                }
            });
        });
        app.post("/inmueble",function(req, res) {
            var inmueble = {
                                nombre : req.body.nombre,
                                tipoInmueble : req.body.tipoInmueble,
                                banhos : req.body.banhos,
                                habitaciones : req.body.habitaciones,
                                superficie : req.body.superficie,
                                descripcion : req.body.descripcion,
                                precio : req.body.precio,
                                vendedor : req.session.usuario,
                                ubicacion : req.body.ubicacion,
                                lat: req.body.lat,
                                lng: req.body.lng,
                            }
                            // Conectarse
            gestorBD.insertarInmueble(inmueble,function(id) {
                if (id == null) {
                    res.send("Error al insertar ");
                } else {
                    if (req.files.fotos != null) {
                        console.log(req.files.fotos)
                        var imagen = req.files.fotos;
                        imagen.mv('public/inmuebles/'+ id+ '.png',function(err) {
                            if (err) {
                                res.send("Error al subir la portada"); 
                            }
                            else{
                                res.send("OK");
                            }
                         });
                        }
                    }
                });
            });
    
    };
    