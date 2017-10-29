module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    pisoAgregarFavorito: function(criterio, id, pisoId, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                var count = db.collection('inmuebles').find({ _id: id, favourite: pisoId }).count( 
                    function(err, result) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            if(result > 0){
                                collection.update(criterio, 
                                                  {$pull: { "favourite" : pisoId }}, 
                                                  function(err, result) {
                                    if (err) {
                                        funcionCallback(null);
                                    } else {
                                        funcionCallback(result);
                                    }
                                });
                            }
                            else{
                                collection.update(criterio, 
                                                  {$push: { "favourite" : pisoId }}, 
                                                  function(err, result) {
                                    if (err) {
                                        funcionCallback(null);
                                    } else {
                                        funcionCallback(result);
                                    }
                                });   
                            }
                            funcionCallback(result);
                        }
                        db.close();
                    });
            }
        });
    },
    pisoValorar: function(criterio, id, valoracion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.update(criterio, 
                    {$push: { "valoracion" : valoracion }}, 
                    function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }   
                    db.close();
                });
            }
        });
    },
    getValoracion: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.find(criterio).toArray(function(err, canciones) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(canciones);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    modificarInmueble : function(criterio, inmueble, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.update(criterio, {$set: inmueble}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    eliminarInmueble : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerInmuebles : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                var collection = db.collection('inmuebles');
                collection.find(criterio).toArray(function(err, inmuebles) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(inmuebles);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerInmueblesPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*4 ).limit( 4 )
                        .toArray(function(err, inmuebles) {

                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(inmuebles, collection.find(criterio).count());
                        }
                        db.close();
                    });

                });
            }
        });
    },
    insertarInmueble : function(inmueble, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('inmuebles');
                collection.insert(inmueble, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
};
