"use strict";


const cgi = require('./cgi');
const auth = require('./auth');


let util = {};

//获取token后发请求
util.request = function(options,cb) {
  auth.getToken((err,access_token) => {
    if (!err) {
      options.qs.access_token = access_token;
      cgi.request(options,function(err,result) {
        if (!err) {
          cb(null,result);
        }else{
          console.error(err,result);
          cb(-1);
        }
      });
    }else{
      cb(err);
    }
  })
}

module.exports = util;

