"use strict";

const logger = require('./lib/logger');

const express = require('express');
const app = express();
const iPort = process.argv[2] || 8080;

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(iPort, function () {
  console.log('Hitler Game Server listening on port %d!',iPort);
});




