"use strict";

let roomMgr = {};

let room_id = 0;

const Room = function(id,uid,config) {
  this.room_id = id;
  this.own_id = uid;
  this.room_player = [uid];
  this.round = 0;
  config.player_num = config.player_num || 5;
  this.config = config;
}

Room.prototype.start = function() {
  if (this.room_player.length <= this.config.player_num) {
    console.error('player not full,need %d now %d',
      this.config.player_num,
      this.room_player.length);
    return false;
  }
  console.log('room %d game start...',this.room_id);
  return true;
}

Room.prototype.join = function(user_id) {
  if (this.room_player.indexOf(user_id) > -1) {
    console.error('user %d alread join in %d',user_id,this.room_id);
    return false;
  }
  this.room_player.push(user_id);
  console.log('room %d new user add %d',this.room_id,user_id);
  console.log('now player count %d',this.room_player.length);
  return true;
}

Room.prototype.end = function() {
  console.log('room %d game end...',this.room_id);
  return true;
}

roomMgr.new = function(user_id,config) {
  room_id++;
  console.log('new room id %d',room_id);
  return new Room(room_id,user_id,config);
}


module.exports = roomMgr;



