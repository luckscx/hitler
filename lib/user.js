"use strict";

const underscore = require('underscore');
const wenxin_user = require('lib/weixin/user');

const defaultName = ['Grissom','Echo','Pinky','Alec', 'Pan','Serena','Claude','Maple','Ender','Figo','Lampard','Rita'];

let User = function(open_id,name,head_url) {
  this.id = open_id;
  this.name = name || underscore.sample(defaultName);
  this.head_url = head_url || '';
  logger.log('welcome new gamer %s',name);
};

User.prototype.changeName = function(newName) {
  this.name = newName;
};

User.prototype.toString = function() {
  return `${this.name}`;
};

let user_map = {};

User.check = function(req,res,next) {
  //logger.log(req.query);
  const open_id = req.query.openid;
  if (open_id) {
    if (user_map[open_id]) {
      req.user = user_map[open_id];
      next();
    }else{
      wenxin_user.getInfo(open_id,function(err,result) {
        if (!err && result) {
          const newUser = new User(result.openid,
                                  result.nickname,
                                  result.headimgurl);
          user_map[open_id] = newUser;
          req.user = newUser;
          next();
        }else{
          res.statusCode(404);
          res.end();
        }
      })
    }
  }else{
    next();
  }
}

if(require.main === module){
  const user = new User();
  console.log("%s",user);
}


module.exports = User;



