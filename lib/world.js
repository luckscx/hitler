
const eventMgr = require('./eventMgr');
const Room = require('./room');
const User = require('./user');
const msg = require('define/msg');
const weixin_msg = require('lib/weixin/message');


let world = {};

let roomMap = {};

eventMgr.on('new_room',function(user,config) {
  const room = new Room(user,config);
  roomMap[room.room_id] = room;
  const echo = new User(1,'Echo');
  const alec = new User(2,'Alec');
  const pan = new User(3,'Pan');
  const pinky = new User(4,'Pinky');
  room.join(echo);
  room.join(alec);
  room.join(pan);
  room.join(pinky);
  weixin_msg.sendCustom(user.id,msg.make('NEW_ROOM',room.room_id));
});

const roomBroudcast = function(room,text) {
  room.players.forEach(function(one){
    weixin_msg.sendCustom(one.id,text);
  });
}

const sendJoinMsg = function(user,room_id) {
  weixin_msg.sendCustom(user.id,msg.make('JOIN_ROOM',user,room_id));
};

const round_start = function(room) {
  
};

eventMgr.on('join_room',function(user,room_id) {
  if (roomMap[room_id]) {
    const room = roomMap[room_id];
    room.join(user);
    room.players.forEach(function(one){
      sendJoinMsg(one,room_id);
    });
    if (room.players.length === room.config.player_num) {
      room.start();
      roomBroudcast(room,'游戏开始！');
    }
  }else{
    weixin_msg.sendCustom(user.id,msg.make('NOT_EXIST_ROOM',room_id));
  }
});




module.exports = world;
