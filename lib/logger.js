"use strict";

const logConfig = {
  format : "{{timestamp}} [{{file}}:{{line}}] {{title}} | {{message}}",
  dateformat : "mm-dd HH:MM:ss.l"
};

const logger = require('tracer').colorConsole(logConfig);

module.exports = logger;




