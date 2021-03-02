'use strict'

const express = require('express');
const  bodyParser = require("body-parser");

const app = express();

// define port to run express app
const  port = process.env.PORT || 3000;

 // use bodyParser middleware on express app
 app.use(bodyParser.urlencoded({ extended:  true }));
 app.use(bodyParser.json());

app.get('/', (req, resp) =>{
    resp.send('Salut les gens !');
})

// Listen to server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

