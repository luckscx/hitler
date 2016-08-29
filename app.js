"use strict";

const logger = require('./lib/logger');

const express = require('express');
const app = express();
const iPort = process.argv[2] || 8080;
const routes = require('./routes');

const world = require('lib/world');

global.logger = logger;

app.use('/',routes);

app.use(express.static('static'));

app.listen(iPort, function () {
  console.log('Hitler Game Server listening on port %d!',iPort);
});




