

const fs = require('fs');
const crypto = require('crypto');
const wxConfig = require('config/weixin');
const logger = require('lib/logger');
const moment = require('moment');
const cgi = require('./cgi');

const token_file = '/tmp/weixin_token';

let now_token = null;

fs.readFile(token_file,'utf8',(err,data) => {
  if (!err && data) {
    try{
      now_token = JSON.parse(data);
    }catch(error){
      console.error(error);
    }
  }
})

const checkTokenVaild = function(tokenObj) {
  if (!tokenObj || !tokenObj.access_token) {
    return false
  }
  const time = tokenObj.time;
  const expire_time = tokenObj.expires_in;
  if (moment().diff(moment.unix(time),'seconds') > expire_time) {
    return true;
  }else{
    return true;
  }
  
};

let auth = {
  generateSignature: function (token, timestamp, nonce) {
    var mixes = [token, timestamp, nonce];
    mixes.sort();
    var str = mixes.join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },
  check: function (token, signature, timestamp, nonce) {
    var newSignature = this.generateSignature(token, timestamp, nonce);
    console.log(newSignature);
    console.log(signature);
    if (newSignature === signature) {
      return true;
    }
    return false;
  },
  getToken : function(cb) {
    if (checkTokenVaild(now_token)) {
      cb(null,now_token.access_token);
      return;
    }
    const options = {
      uri : 'token',
      qs : {
        grant_type: 'client_credential',
        appid: wxConfig.appid,
        secret: wxConfig.appsecret
      },
    }
    cgi.request(options,function(err,result) {
      let now_token = null;
      if (!err) {
        logger.log(result);
        result.time = moment().unix();
        now_token = result;
        fs.writeFile(token_file,JSON.stringify(result),'utf8');
        cb(null,result.access_token);
      }else{
        logger.error('failed');
        cb(-1);
      }
    })
  },
};

if(require.main === module){
  setTimeout(function() {
    auth.getToken(function(err,token) {
      console.log(err);
      console.log(token);
    });
  },1000);
}




module.exports = auth;
