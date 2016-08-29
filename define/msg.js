"use strict";

const util = require('util');
let msg = {};

const msgEnum = {
  NEW_ROOM : '已建立新房间，房间号%d',
  JOIN_ROOM : ' %s 加入了房间 %d',
  NOT_EXIST_ROOM : '不存在的房间号 %d'
}

msg.make = function(type,...items) {
  if (msgEnum[type]) {
    return util.format(msgEnum[type],...items);
  }else{
    console.error('error msg type',type);
    return '';
  }
}

module.exports = msg;




