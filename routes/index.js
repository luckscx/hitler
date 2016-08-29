"use strict";

var express = require('express');
var router = express.Router();
const weixinAuth = require('lib/weixin/auth');
const user = require('lib/user');
const message = require('lib/message');

var morgan = require('morgan')
router.use(morgan('combined'))

const xmlparser = require('express-xml-bodyparser');
router.use(xmlparser());

router.get('/',function(req,res) {
  const params = req.query;
  logger.log(params);
  const check_res = weixinAuth.check('grissom',params.signature,
               params.timestamp,params.nonce);
  if (check_res) {
    res.send(req.query.echostr);
  }else{
    res.end();
  }
});

router.use(user.check);

router.post('/',function(req,res) {
  const params = req.body.xml;
  logger.log(params);
  logger.log(req.user);
  message.parse(req,params);
  res.end();
});


module.exports = router;







