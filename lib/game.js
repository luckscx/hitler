"use strict";

const underscore = require('underscore');
const rule = require('../config/rule');
const logger = require('./logger');

const _shuffleRole = function(player_num,players) {
  const roleMap = rule.roleMap[player_num];
  const role_list = underscore.shuffle(roleMap);
  const roleResult = {};
  players.forEach(function(one,idx){
    roleResult[one.id] = role_list[idx];
  });
  return roleResult;
};

const roundStatusEnum = {
  Nominate : 0,
  Vote : 1,
  President_Choose : 2,
  Chancellor_Choose : 3,
  President_Power : 4
};

let Game = function(config,players) {
  this.roleMap = _shuffleRole(config.player_num,players);
  this.deck = rule.initDeck();
  this.round = 1;
  this.nowPresident = underscore.sample(players).id;
  this.nowChancellor = -1; //underfined
  this.round_status = roundStatusEnum.Nominate; // 0 nominate 1 vote 2 President Choose 3 Chancellor Choose 4 POWERS
  this.last_government = [];
  this.published_policy = [];
  console.log(this);
};

Game.prototype.nominate = function(leader,nomi_id) {
  if (this.round_status !== roundStatusEnum.Nominate) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }

  if (leader.id !== this.leader) {
    logger.warn('%s not presend President !',leader);
    return false;
  }

  if (this.last_government.indexOf(nomi_id) > -1) {
    logger.warn('last government member not allowed as new Chancellor');
    return false;
  }

  this.nowChancellor = nomi_id;
  this.round_status = roundStatusEnum.Vote;
  return true;
};


module.exports = Game;



