module.exports = function(app, swig, gestorBD) {
    app.get("/inmuebles", function(req, res) {
        var criterio = {};
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }else{
            if(req.query.ubicacion.length == 0) req.query.ubicacion = '';
            if(req.query.precioDesde.length == 0) req.query.precioDesde = '';
            if(req.query.precioHasta.length == 0) req.query.precioHasta = '';
            if(req.query.tipo.length == 0) req.query.tipo = '';
            criterio = {
                "ubicacion" : {
                    $regex : ".*" + req.query.ubicacion + ".*"
                },
                "precio":{
                    $gte: req.query.precioDesde.length == 0 ? '0' : req.query.precioDesde,
                    $lte: req.query.precioHasta.length == 0 ? '5000000' : req.query.precioHasta
                },
                "tipoInmueble":{
                    $regex : ".*" + req.query.tipo + ".*"
                }
            };
        }
        gestorBD.obtenerInmueblesPg(criterio, pg, function(inmuebles, total ) {
            if (inmuebles == null) {
                res.send("Error al listar ");
            } else {
                total.then(function(result) {
                    var ultimaPg = result/4;
                    if (result % 4 > 0 ){ // Sobran decimales
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
                        tipo : req.query.tipo,
                        precioDesde: req.query.precioDesde,
                        precioHasta: req.query.precioHasta,
                        ubicacion: req.query.ubicacion,
                        inmuebles : inmuebles,
                        paginas : paginas,
                        actual : pg
                    });
                    res.send(respuesta);
                });
            }
        });

    }),
        app.post("/inmuebles", function(req, res) {
        var criterio = {};
        if (req.body.tipoInmueble != null) {
            criterio = {
                "ubicacion" : {
                    $regex : ".*" + req.body.ubicacion + ".*"
                },
                "precio":{
                    $gte: req.body.precioDesde.length == 0 ? '0' : req.body.precioDesde,
                    $lte: req.body.precioHasta.length == 0 ? '5000000' : req.body.precioHasta
                },
                "tipoInmueble":{
                    $eq : req.body.tipoInmueble
                }
            };
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerInmueblesPg(criterio, pg , function(inmuebles, total) {
            if (inmuebles == null) {
                res.send("Error al listar ");
            } else {
                total.then(function(result) {
                    var ultimaPg = result/4;
                    if (result % 4 > 0 ){ // Sobran decimales
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
                        tipo : req.body.tipoInmueble,
                        precioDesde: req.body.precioDesde,
                        precioHasta: req.body.precioHasta,
                        ubicacion: req.body.ubicacion,
                        inmuebles : inmuebles,
                        paginas : paginas,
                        actual : pg
                    });
                    res.send(respuesta);
                });
            }
        });

    }),
        app.get('/inmueble/:id', function(req, res) {
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id)
        };

        gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
            if (inmuebles == null) {
                return res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/binmueble.html', {
                    inmueble : inmuebles[0],
                    precio: parseInt(inmuebles[0].precio).toLocaleString("es-ES").replace(/,/g, '.'),
                    usuario: req.session.usuario,
                    valoracionGlobal: inmuebles[0].valoracion.reduce(function(a, b) { return parseInt(a) + parseInt(b); })/ parseInt(inmuebles[0].valoracion.length == 1 ? 1 : inmuebles[0].valoracion.length - 1)
                });
                return res.send(respuesta);
            }
        });
    }),
        app.get('/inmueble/eliminar/:id', function(req, res) {
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id)
        };

        gestorBD.eliminarInmueble(criterio, function(inmuebles) {
            if (inmuebles == null) {
                res.send(respuesta);
            } else {
                var criterio = {
                    vendedor : req.session.usuario
                };
                gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                    if (inmuebles == null) {
                        res.send("Error al listar ");
                    } else {
                        var respuesta = swig.renderFile('views/bmisinmuebles.html?mensaje=Inmueble eliminado', {
                            inmuebles : inmuebles
                        });
                        res.send(respuesta);
                    }
                });
            }
        });
    }),
        app.get('/inmueble/modificar/:id', function(req, res) {
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(req.params.id)
        };

        gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
            if (inmuebles == null) {
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/binmuebleModificar.html',
                                                {
                    inmueble : inmuebles[0]
                });
                res.send(respuesta);
            }
        });
    }),
        app.post('/inmueble/modificar/:id', function(req, res) {
        var id = req.params.id;
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(id)
        };

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
            fechaModificacion: new Date()
        }
        if(req.files.fotos != null){
            inmueble.imagenes = req.files.fotos;
        }

        gestorBD.modificarInmueble(criterio, inmueble, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarFotos(req.files, id, function(result) {
                    if (result == null) {
                        res.send("Error en la modificación");
                    } else {
                        var criterio = {
                            vendedor : req.session.usuario
                        };
                        gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                            if (inmuebles == null) {
                                res.send("Error al listar ");
                            } else {
                                var respuesta = swig.renderFile('views/bmisinmuebles.html?mensaje=Inmueble modificado', {
                                    inmuebles : inmuebles
                                });
                                res.send(respuesta);
                            }
                        });
                    }
                });

            }
        });

    })
    function paso1ModificarFotos(files, id, callback) {
        var imagenes = []
        if (files.fotos != null) {
            if(files.fotos.length==undefined){
                imagenes.push(files.fotos);
            }
            else{
                for (i = 0; i < files.fotos.length; i++) { 
                    imagenes.push(files.fotos[i]);
                }
            }

        }
        if (imagenes != []) {
            for (i = 0; i < imagenes.length; i++) { 
                var imagen = imagenes[i];
                imagen.mv('public/inmuebles/'+ id+"_"+(i+1)+'.png',function(err) {
                    if (err) {
                        callback(null); 
                    }
                });
                var sharp =  app.get('sharp');
                sharp(imagenes[i].data).resize(50, 50)
                    .crop(sharp.gravity.centre)
                    .toFile('./public/thumbs/'+ id+"_"+(i+1)+'.png',function (err, buf) {
                    if (err){
                        callback(null); 
                    } 
                })
            }
            callback(true); 
        }
    }
    app.get('/inmuebles/agregar', function(req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    });
    app.get('/inmuebles/cambiarFavorito', function(req, res) {
        var id = req.query.id;
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(id)
        };
        gestorBD.pisoAgregarFavorito(criterio, gestorBD.mongo.ObjectID(id), req.session.usuario, function(result) {
            var respuesta = null;
            if (result == null) {
                return res.send("Error al modificar ");
            } else {
                var criterio = {
                    favourite:{$elemMatch:{$eq: req.session.usuario }}
                };
                gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                    if (inmuebles == null) {
                        res.send("Error al listar ");
                    } else {
                        var respuesta = swig.renderFile('views/bmisfavoritos.html', {
                            inmuebles : inmuebles
                        });
                        res.send(respuesta);
                    }
                });
            }
        });
    });
    app.post('/inmuebles/valorar/:id', function(req, res) {
        var id = req.params.id;
        var criterio = {
            "_id" : gestorBD.mongo.ObjectID(id)
        };
        gestorBD.pisoValorar(criterio, gestorBD.mongo.ObjectID(id), req.body.starr, function(result) {
            var respuesta = null;
            if (result == null) {
                return res.send("Error al modificar ");
            } else {
                var criterio = {
                    _id : gestorBD.mongo.ObjectID(id)
                };
                gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                    if (inmuebles == null) {
                        res.send("Error al listar ");
                    } else {
                        var respuesta = swig.renderFile('views/binmueble.html?mensaje=Nuevo valoracion registrada', {
                            inmueble : inmuebles[0],
                            precio: parseInt(inmuebles[0].precio).toLocaleString("es-ES").replace(/,/g, '.'),
                            usuario: req.session.usuario,
                            valoracionGlobal: Math.round(inmuebles[0].valoracion.reduce(function(a, b) { return parseInt(a) + parseInt(b); })/ parseInt(inmuebles[0].valoracion.length == 1 ? 1 : inmuebles[0].valoracion.length - 1) * 10 ) / 10
                        });
                        return res.send(respuesta);
                    }
                });
            }
        });
    });
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
    app.get("/misfavoritos", function(req, res) {
        var criterio = {
            favourite:{$elemMatch:{$eq: req.session.usuario }}
        };

        gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
            if (inmuebles == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/bmisfavoritos.html', {
                    inmuebles : inmuebles
                });
                res.send(respuesta);
            }
        });
    });
    app.post("/inmueble",function(req, res) {
        var imagenes = []
        if (req.files.fotos != null) {
            if(req.files.fotos.length==undefined){
                imagenes.push(req.files.fotos);
            }
            else{
                for (i = 0; i < req.files.fotos.length; i++) { 
                    imagenes.push(req.files.fotos[i]);
                }
            }

        }
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
            fechaPublicacion: new Date(),
            imagenes: imagenes,
            valoracion: [0]
        }
        gestorBD.insertarInmueble(inmueble,function(id) {
            if (id == null) {
                res.send("Error al insertar ");
            } else {
                if (imagenes != []) {
                    for (i = 0; i < imagenes.length; i++) { 
                        var imagen = imagenes[i];
                        imagen.mv('public/inmuebles/'+ id+"_"+(i+1)+'.png',function(err) {
                            if (err) {
                                res.send("Error al subir las imagenes"); 
                            }
                        });
                        var sharp =  app.get('sharp');
                        sharp(imagenes[i].data).resize(50, 50)
                            .crop(sharp.gravity.centre)
                            .toFile('./public/thumbs/'+ id+"_"+(i+1)+'.png',function (err, buf) {
                            if (err) return next(err)
                        })
                    }
                    var criterio = {
                        vendedor : req.session.usuario
                    };
                    gestorBD.obtenerInmuebles(criterio, function(inmuebles) {
                        if (inmuebles == null) {
                            res.send("Error al listar ");
                        } else {
                            var respuesta = swig.renderFile('views/bmisinmuebles.html?mensaje=Nuevo inmueble añadido', {
                                inmuebles : inmuebles
                            });
                            res.send(respuesta);
                        }
                    });
                }

            }
        });
    });

};
