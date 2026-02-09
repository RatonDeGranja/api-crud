'use strict'

const port = process.env.PORT || 3000;

const express = require('express');
const logger = require('morgan');
const app = express();

//Middleware

app.use(logger('dev'));

//Implementamos api restful
app.get('/api/product', (req, res) => {
    res.status(200);
    res.send({ productos: []});
});
app.get('/api/product/:productID', (req, res) => {
    const productID = req.params.productID;

    res.status(200);
    res.send({producto: productID});
});

app.post('/api/product', (req,res) => {
    const queProducto = req.body;
    console.log(queProducto);
    res.status(200);
    res.send({
        mensaje: 'Producto creado',
        producto: queProducto
    });

});

app.put('/api/product/:productID', (req, res)=> {
    const queProducto = req.body;
    const productID = req.params.productID;

    res.status(200);
    res.send({
        mensaje: 'Se ha modificado el producto ${productID}',
        producto: queProducto
    });
});

app.delete('/api/product/:productID', (req, res)=>{
    const productID = req.params.productID;

    res.status(200);
    res.send({mensaje: 'Se ha eliminado el producto ${productID}'});

});

//Declaramos los middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Lanzamos el servicio API

app.listen(port, ()=> {
    console.log('API REST ejecutándose en https://localhost:${port}/api/product');
    
})