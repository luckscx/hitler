"use strict";

const request = require('request');
const logger = require('lib/logger');

const weixinBaseUrl = 'https://api.weixin.qq.com/cgi-bin/';


let cgi = {
  request : function(options,cb) {
    logger.log('request %j',options);
    options.baseUrl = weixinBaseUrl;
    options.json = true;
    request(options,(err,res,body) => {
      if (!err) {
        cb(null,body);
      }else{
        console.error(err);
        cb(-1);
      }
    })
  }
};

module.exports = cgi;

