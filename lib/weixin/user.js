

const weixin_util = require('./util');


let user = {};

user.getInfo = function(open_id,cb) {
  //http请求方式: GET
  //https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN 
  const options = {
    url : 'user/info',
    qs : {
      openid : open_id,
      lang : 'zh_CN'
    }
  }
  weixin_util.request(options,function(err,result) {
    //logger.log(result);
    if (!err && result) {
      cb(null,result);
    }else{
      cb(-1);
    }
  });
}

module.exports = user;
