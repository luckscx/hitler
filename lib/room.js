"use strict";

let room_id = 0;

let Room = function(user,config) {
  room_id++;
  console.log('new room id %d',room_id);
  this.room_id = room_id;
  this.own_id = user.id;
  this.room_player = [user];
  this.round = 0;
  config.player_num = config.player_num || 5;
  this.config = config;
};

Room.prototype.start = function() {
  if (this.room_player.length < this.config.player_num) {
    console.error('player not full,need %d now %d',
      this.config.player_num,
      this.room_player.length);
    return false;
  }
  console.log('room %d game start...',this.room_id);
  return true;
};

Room.prototype.join = function(user) {
  if (this.room_player.indexOf(user) > -1) {
    console.error('user %d alread join in %d',user,this.room_id);
    return false;
  }
  this.room_player.push(user);
  console.log('room %d new user add %s',this.room_id,user);
  console.log('now player count %d',this.room_player.length);
  return true;
};


Room.prototype.end = function() {
  console.log('room %d game end...',this.room_id);
  return true;
};


module.exports = Room;



