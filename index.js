'use strict'

const config = require('./config');

const fs = require('fs');
const https = require('https');
const helmet = require('helmet');

const port = process.env.PORT || 3000;

const express = require('express');
const logger = require('morgan');
const app = express();


const mongojs = require('mongojs');
const db = mongojs('mongodb://127.0.0.1:27017/SD');
var id = mongojs.ObjectID;

app.param("coleccion", (req, res, next, coleccion) =>{
    req.collection = db.collection(coleccion);
    return next();
});


const cors = require('cors');

//Declaraciones

var allowCrossTokenOrigin = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    return next();
};

var allowCrossTokenMethods = (req, res, next) => {
    res.header("Access-Control-Allow-Methods", "*");
    return next();
};

var allowCrossTokenHeaders = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    return next();
};


const auth = (req, res, next) => { // declaramos la función auth
    if ( !req.headers.token ) { // si no se envía el token...
    res.status(401).json({ result: 'KO', msg: "Envía un código válido en la cabecera 'token'"});
    return;
    };
    const queToken = req.headers.token; // recogemos el token de la cabecera llamada “token”
    if (queToken === "password1234") { // si coincide con nuestro password...
    return next(); // continuamos con la ejecución del código
    } else { // en caso contrario...
    res.status(401).json({ result: 'KO', msg: "No autorizado" });
    };
}; 

//Middleware

app.use(cors());
app.use(allowCrossTokenHeaders);
app.use(allowCrossTokenMethods);
app.use(allowCrossTokenOrigin);

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

app.get('/api', (req, res, next) => {
    console.log('GET /api https');
    db.getCollectionNames((err, colecciones) => {
        if (err) return next(err);
        res.json(colecciones);
    });
}); 

app.get('/api/:coleccion', (req, res, next) => {
    req.collection.find((err, coleccion) => {
        if (err) return next(err);
        res.json(coleccion);
    });
});

app.get('/api/:coleccion/:id', (req, res, next) => {
    req.collection.findOne({_id: id(req.params.id)}, (err, elemento) => {
        if (err) return next(err);
        res.json(elemento);
    });
});

app.post('/api/:coleccion', auth, (req, res, next) => {
    const elemento = req.body;
    req.collection.save(elemento, (err, coleccionGuardada) => {
    if (err) return next(err);
    res.json(coleccionGuardada);
    });


});

app.put('/api/:coleccion/:id', auth, (req, res, next) => {
    const elementoId = req.params.id;
    const elementoNuevo = req.body;

    req.collection.update(
        {_id: id(elementoId)},
        {$set: elementoNuevo},
        {safe: true, multi: false},
        (err, elementoModif) => {
            if (err) return next(err);
            res.json(elementoModif);
        }
    );
});

app.delete('/api/:coleccion/:id', auth, (req, res, next) => {
    req.collection.remove({_id: id(req.params.id)}, (err, resultado) => {
        if (err) return next(err);
        res.json(resultado);
    });
});

//Canal seguro para lanzar el servidor
https.createServer({
        cert: fs.readFileSync('./cert/cert.pem'),
        key: fs.readFileSync('./cert/key.pem')
}, app).listen(port, () => {
    console.log(`Servidor corriendo seguro: http://localhost:${port}/api/:coleccion/:id`);
});