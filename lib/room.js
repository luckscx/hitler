"use strict";

const Joi = require('joi');
const logger = require('./logger');
const Game = require('./game');
let room_id = 0;


const roomConfigschema = Joi.object().keys({
    player_num : Joi.number().integer().min(5).max(10)
});

let Room = function(user,config) {
  room_id++;
  logger.log('new room id %d',room_id);
  this.room_id = room_id;
  this.owner = user;
  this.players = [user];
  this.status = 0;  // 0 ready 1 playing 2 idle
  config.player_num = config.player_num || 5;
  const res = Joi.validate(config,roomConfigschema);
  if (!res.error) {
    this.config = res.value;
  }else{
    console.error('error config format');
    return null;
  }
};

Room.prototype.start = function() {
  if (this.players.length !== this.config.player_num) {
    logger.warn('player not full,need %d now %d',
      this.config.player_num,
      this.players.length);
    return false;
  }
  if (this.status === 0) {
    logger.log('room %d game start...',this.room_id);
    this.game = new Game(this.config,this.players);
    this.status = 1;
    return true;
  }else{
    logger.warn('room status %d',this.status);
    return false;
  }
};

Room.prototype.join = function(user) {
  if (this.players.indexOf(user) > -1) {
    logger.warn('user %s alread join in %d',user,this.room_id);
    return false;
  }

  if (this.round > 0) {
    logger.warn('room %d alread start',this.room_id);
    return false;
  }
  this.players.push(user);
  logger.log('room %d new user add %s',this.room_id,user);
  logger.log('now player count %d',this.players.length);
  return true;
};

Room.prototype.showInfo = function() {
  //logger.log('room :',this);
  //logger.log('user :',this.players);
  //logger.log('game :',this.name);
};


Room.prototype.end = function() {
  logger.log('room %d game end...',this.room_id);
  this.status = 2;
  return true;
};


module.exports = Room;



