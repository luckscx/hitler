/* jshint node:true*/
"use strict";

const weixin_util = require('./util');
const wxConfig = require('config/weixin');
const request = require('request');

let now_token = null;

//just offline need

const createMenu = function() {
  const obj = [{	
    "name":"揭秘希特勒",
    "sub_button" : [{
      "type" : "click",
      "name" : "新建房间",
      "key"  : "new_room"
    }]
  },{
    "name":"关于我们",
    "sub_button":[
      {	
        "type":"view",
        "name":"腾讯先游",
        "url":"http://m.gamer.qq.com/"
      },
      {
        "type":"click",
        "name":"赞一下我们",
        "key":"V1001_GOOD"
      }]
  }];

  const options = {
    method : 'POST',
    qs : {
      access_token : now_token
    },
    body : {
      "button" : obj
    },
  }
  request.post(options,(err,res,body) => {
    console.log(body);
  });
};





