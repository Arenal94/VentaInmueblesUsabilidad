module.exports = {
	mongo : null,
	app : null,
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
	},
	obtenerCancionesPg : function(criterio,pg,funcionCallback){
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				
				var collection = db.collection('canciones');
				collection.count(function(err, count){

					collection.find(criterio).skip( (pg-1)*4 ).limit( 4 )
						.toArray(function(err, canciones) {
							
						if (err) {
							funcionCallback(null);
						} else {
							funcionCallback(canciones, count);
						}
						db.close();
					});
					
				});
			}
		});
	},
	usuarioCancionesCompradas: function(criterioUsuario, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				
				var collection = db.collection('usuarios');
				collection.find(criterioUsuario).toArray(function(err, usuarios) {
					if (err) {
						funcionCallback(null);
					} else {
						var ArrayIds = usuarios[0].compras;
					
						if (ArrayIds == null){ // Puede no tener compras
							funcionCallback( {} );
							db.close();
							return;
						}

						var collection = db.collection('canciones');
						collection.find({ "_id" : { $in: ArrayIds } })
							.toArray(function(err, canciones) {
								
							if (err) {
								funcionCallback(null);
							} else {
								funcionCallback(canciones);
							}
							db.close();
						});
					}
				});
			}
		});
	},
	usuarioComprarCancion: function(criterioUsuario, cancionId, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
			
				collection.update(criterioUsuario, 
						{ $push: { "compras" : cancionId } }  , 
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
	eliminarCancion : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
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
	modificarCancion : function(criterio, cancion, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.update(criterio, {$set: cancion}, function(err, result) {
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
	obtenerCanciones : function(criterio,funcionCallback){
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				
				var collection = db.collection('canciones');
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
	insertarCancion : function(cancion, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.insert(cancion, function(err, result) {
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
							funcionCallback(inmuebles, count);
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
