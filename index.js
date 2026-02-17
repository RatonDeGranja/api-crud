'use strict'

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




//Middleware

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/api', (req, res, next) => {
    console.log('GET /api');
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

app.post('/api/:coleccion', (req, res, next) => {
    const elemento = req.body;
    if (!elemento.nombre) {
        res.status(400).json({
        error: 'Bad data',
        description: 'Se precisa al menos un campo <nombre>'
        });
    } else {
        req.collection.save(elemento, (err, coleccionGuardada) => {
        if (err) return next(err);
        res.json(coleccionGuardada);
        });
        } 

});

app.put('/api/:coleccion/:id', (req, res, next) => {
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

app.delete('/api/:coleccion/:id', (req, res, next) => {
    req.collection.remove({_id: id(req.params.id)}, (err, resultado) => {
        if (err) return next(err);
        res.json(resultado);
    });
});

app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/:coleccion/:id`);
});