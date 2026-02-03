'use strict'

const port = process.env.PORT || 8888;

const express = require('express');
const logger = require('morgan');
const app = express();

//Middleware

app.use(logger('dev'));

//Se declara el api
app.get('/hola/:unNombre', (req, res) => {
    res.status(200).send({ mensaje: `Hola ${req.params.unNombre} desde Express!` });
});

app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/hola/:unNombre`);
});