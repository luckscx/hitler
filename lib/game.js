"use strict";

const _ = require('underscore');
const moment = require('moment');
const rule = require('../config/rule');
const logger = require('./logger');

const _shuffleRole = function(player_num,players) {
  const roleMap = rule.roleMap[player_num];
  const role_list = _.shuffle(roleMap);
  const roleResult = {};
  for(let i=0;i<player_num;i++){
    roleResult[i] = {
      user : players[i],
      role : role_list[i],
    };
  }
  return roleResult;
};

const roundStatusEnum = {
  Nominate : 0,
  Vote : 1,
  President_Choose : 2,
  Chancellor_Choose : 3,
  President_Power : 4,
  FINISH : 99 
};

let Game = function(config,players) {
  this.roleMap = _shuffleRole(config.player_num,players);
  this.deck = rule.initDeck();
  logger.log('game start with deck %j',this.deck);
  this.hand_deck = [];
  this.drop_deck = [];
  this.round = 0;
  this.election_tracker = 0;
  this.published_policy = [];
  this.last_government = [];
  this.player_num = config.player_num;
  this.newRound();
  this.startTime = moment();
  //this.addLog('game start');
};


Game.prototype.newRound = function() {
  this.round++;
  logger.log('new round %d start',this.round);
  this.addLog(`new round ${this.round} start`);
  this.president_index = _nextPresident(this.player_num,this.president_index);
  if (this.round_status === roundStatusEnum.FINISH) {
    logger.error('game finshed !');
    return;
  }

  if (this.deck.length < 3) {
    this.deck = _.shuffle(this.drop_deck).concat(this.deck);
    this.drop_deck = [];
  }

  logger.log('deck : %j',this.deck);
  logger.log('drop_deck : %j',this.drop_deck);
  this.round_status = roundStatusEnum.Nominate;
  this.voteMap = {};
  this.hand_deck = [];
  this.chancellor_index = -1;
};

const _nextPresident = function(player_num,now_index) {
  if (!now_index) {
    //very beginning
    return parseInt(Math.random() * player_num);
  }else{
    return (now_index + 1) % player_num;
  }
};

Game.prototype.addLog = function(szStr) {
  //logger.log('add log :',szStr);
  const second = moment().diff(this.startTime,'second');
  szStr = second + '|' + szStr;
  if (!this.history_log) {
    this.history_log = [szStr];
  }else{
    this.history_log.push(szStr);
  }
};

Game.prototype.nominate = function(user_num,nomi_num) {
  if (this.round_status !== roundStatusEnum.Nominate) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }
  let user,nomi_user;
  try{
    user = this.roleMap[user_num].user;
    nomi_user = this.roleMap[nomi_num].user;
  }catch(TypeError){
    logger.warn('not vaild user num');
    return false;
  }

  if (user_num !== this.president_index) {
    logger.warn('%s not now President !',user);
    return false;
  }

  if (user_num === nomi_num) {
    logger.warn('can not choose self');
    return false;
  }

  if (this.last_government.indexOf(nomi_num) > -1) {
    logger.warn('last government member not allowed as new Chancellor');
    return false;
  }

  this.chancellor_index = nomi_num;
  logger.log('%s choose %s as Chancellor, discuss and vote:',user,nomi_user);
  this.addLog( `${user} choose ${nomi_user} as Chancellor`);
  this.round_status = roundStatusEnum.Vote;

  return true;
};


Game.prototype.vote = function(user_num,result) {
  if (this.round_status !== roundStatusEnum.Vote) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }
  const user = this.roleMap[user_num].user;
  if (!user) {
    logger.warn('error user_num %d',user_num);
    return false;
  }

  if (typeof this.voteMap[user_num] !== 'undefined') {
    logger.warn('%s has voted for this round',user);
    return false;
  }

  this.voteMap[user_num] = result;  
  if (_.keys(this.voteMap).length === this.player_num) {
    const voteResult = _.pairs(this.voteMap);
    logger.log('voteResult: %j',voteResult);
    this.addLog('voteResult:  ' + voteResult);
    let okCnt = 0;
    voteResult.forEach(function(one,idx){
      if (one[1] === true) {
        okCnt++;
      }
    });
    if (okCnt > Math.ceil(this.player_num / 2)) {
        this.round_status = roundStatusEnum.President_Choose;
        this.hand_deck.push(this.deck.pop());
        this.hand_deck.push(this.deck.pop());
        this.hand_deck.push(this.deck.pop());
        this.addLog('vote passed');
    }else{
      this.addLog('vote reject nomi');
      this.election_tracker++;
      if (this.election_tracker === rule.max_election_tracker) {
        this.election_tracker = 0;
        const newPolicyType = this.deck.pop();
        logger.warn(this.deck);
        this.newPolicy(newPolicyType);
        this.newRound();
        // add new policy
      }else{
        this.newRound();
      }
    }
  }
};

Game.prototype.presidentChoose = function(user_num,dropCard) {
  if (this.round_status !== roundStatusEnum.President_Choose) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }

  const user = this.roleMap[user_num].user;
  if (!user || user_num !== this.president_index) {
    logger.warn('error user_num %d',user_num);
    return false;
  }

  let dropIndex = this.hand_deck.indexOf(dropCard);
  if ( dropIndex === -1 ) {
    logger.warn('not hand card');
    return false;
  }

  logger.log('dropIndex %d in handdeck %j',dropIndex,this.hand_deck);
  this.drop_deck.push(this.hand_deck[dropIndex]);
  this.hand_deck.splice(dropIndex,1);
  logger.log('President %s drop %s,left %j to Chancellor',user,dropCard,this.hand_deck);
  this.round_status = roundStatusEnum.Chancellor_Choose;
};

Game.prototype.chancellorChoose = function(user_num,dropCard) {
  if (this.round_status !== roundStatusEnum.Chancellor_Choose) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }

  const user = this.roleMap[user_num].user;
  if (!user || user_num !== this.chancellor_index) {
    logger.warn('error user_num %d',user_num);
    return false;
  }

  let dropIndex = this.hand_deck.indexOf(dropCard);
  if ( dropIndex === -1 ) {
    logger.warn('not hand card');
    return false;
  }

  this.drop_deck.push(this.hand_deck[dropIndex]);
  this.hand_deck.splice(dropIndex,1);
  logger.log('Chancellor %s drop %s,left %j for publish',user,dropCard,this.hand_deck);
  this.newPolicy(this.hand_deck[0]);
  this.newRound();
};

Game.prototype.power = function(user_num,target_num) {
  if (this.round_status !== roundStatusEnum.President_Power) {
    logger.warn('round_status error %d',this.round_status);
    return false;
  }

  const user = this.roleMap[user_num].user;
  if (!user || user_num !== this.president_index) {
    logger.warn('error user_num %d',user_num);
    return false;
  }

  const fascistCnt = this.countFascistPolicy();

  this.newRound();
};

Game.prototype.countFascistPolicy = function() {
  let iCount = 0;
  logger.log('published : ',this.published_policy);
  this.published_policy.forEach(function(one,idx){
    if (one === rule.ENUM.Fascist) {
      iCount++;
    }
  });
  return iCount;
};


Game.prototype.newPolicy = function(newPolicyType) {
  this.addLog('new Policy Published : ' + newPolicyType);
  this.published_policy.push(newPolicyType);
  const fascistCnt = this.countFascistPolicy();
  if (fascistCnt >= rule.fascist_win_cnt) {
    logger.log('Fascist Win!!!');
    this.round_status = roundStatusEnum.FINISH;
    logger.error(this.round_status);
  }
  if (this.published_policy.length - fascistCnt >= rule.libera_win_cnt) {
    logger.log('Liberal Win!!!');
    this.round_status = roundStatusEnum.FINISH;
  }
};


module.exports = Game;



