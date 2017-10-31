const express = require('express');
const app = express();

var expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

var mailer = require('express-mailer');
mailer.extend(app, {
    from: 'emailtestadrianarenal@gmail.com',
    host: 'smtp.gmail.com',
    secureConnection: true, 
    port: 465,
    transportMethod: 'SMTP',
    auth: {
        user: 'emailtestadrianarenal@gmail.com',
        pass: 'emailtest'
    }
});
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(function(req,res,next){
    var _send = res.send;
    var sent = false;
    res.send = function(data){
        if(sent) return;
        _send.bind(res)(data);
        sent = true;
    };
    next();
});

var sharp = require('sharp');
app.set('sharp',sharp);

var crypto = require('crypto');
var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo= require('mongodb');
var swig  = require('swig');

swig.setFilter('timePast', function(element) {
    var date1 = element;
    var date2 = new Date();
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffSecs = Math.round(timeDiff / 1000); // seconds
    var diffMins = Math.round(timeDiff / 60000); // minutes
    var diffHours = Math.round(timeDiff / 1000/60/60); // hours
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    if(diffSecs<60)
        return `Publicado hace ${diffSecs} segundo(s)`;
    if(diffMins<60)
        return `Publicado hace ${diffMins} minuto(s)`;
    if(diffHours<24)
        return `Publicado hace ${diffHours} hora(s)`;
    else 
        return `Publicado hace ${diffDays} día(s)`;
  });

  swig.setFilter('days', function(element) {
    var date1 = element;
    var date2 = new Date();
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        return diffDays;
  });


var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

//routerUsuarioSession
var routerUsuarioSession = express.Router(); 
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/inmuebles/agregar",routerUsuarioSession);
app.use("/usuario/perfil",routerUsuarioSession);
app.use("/misinmuebles",routerUsuarioSession);
app.use("/misfavoritos",routerUsuarioSession);
app.use("/inmuebles/cambiarFavorito",routerUsuarioSession);


app.use(express.static('public'));

app.set('port', process.env.PORT || 8081);
app.set('db','mongodb://miw:miw@ds233895.mlab.com:33895/dpiu');
app.set('clave','abcdefg');
app.set('crypto',crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rinmuebles.js")(app, swig, gestorBD);
app.get('/', function (req, res) {
    res.redirect('/inmuebles');
})
app.use( function (err, req, res, next ) {
    console.log("Error producido: " + err);
    if (! res.headersSent) { 
        res.status(400);
        res.send("Recurso no disponible");
    }
});

app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});
