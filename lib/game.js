"use strict";

const _ = require('underscore');
const moment = require('moment');
const rule = require('../config/rule');
const logger = require('./logger');


const roundStatusEnum = {
  Nominate : 0,
  Vote : 1,
  President_Choose : 2,
  Chancellor_Choose : 3,
  President_Power : 4,
  FINISH : 99 
};

const sEnum = roundStatusEnum;

let nextStatusMap = {};

nextStatusMap[sEnum.Nominate] = [sEnum.Vote,sEnum.Nominate];
nextStatusMap[sEnum.Vote] = [sEnum.President_Choose,sEnum.FINISH,sEnum.Nominate];
nextStatusMap[sEnum.President_Choose] = [sEnum.Chancellor_Choose];
nextStatusMap[sEnum.Chancellor_Choose] = [sEnum.FINISH,sEnum.President_Power,sEnum.Nominate];
nextStatusMap[sEnum.President_Power] = [sEnum.FINISH,sEnum.Nominate];
nextStatusMap[sEnum.FINISH] = [];

let Game = function(config,players) {
  this.player_num = config.player_num;
  this.shuffleRole(players);
  this.deck = config.set_deck || rule.initDeck();
  logger.log('roleMap',this.roleMap);
  logger.log('game start with deck %j',this.deck);
  this.hand_deck = [];
  this.drop_deck = [];
  this.round = 0;
  this.election_tracker = 0;
  this.published_policy = [];
  this.last_government = [];
  this.newRound();
  this.startTime = moment();
  //this.addLog('game start');
};


Game.prototype.setStatus = function(statusType) {
  if (typeof this.round_status === 'undefined') {
    //very beginning
    this.round_status = statusType;
    return;
  }
  const allowStatus = nextStatusMap[this.round_status];
  if (allowStatus.indexOf(statusType) > -1) {
    this.round_status = statusType;
  }else{
    logger.error('error status %d to %d',this.round_status,statusType);
  }
};

Game.prototype.shuffleRole = function(players) {
  const roleMap = rule.roleMap[this.player_num];
  const role_list = _.shuffle(roleMap);
  let roleResult = {};
  for(let i=0;i<this.player_num;i++){
    roleResult[i] = {
      user : players[i],
      role : role_list[i],
    };
    if (role_list[i] === rule.ENUM.Hitler) {
      this.HitlerPlayer = i;
    }
  }
  this.roleMap = roleResult;
};

Game.prototype.indexToName = function(idx) {
  if (this.roleMap[idx]) {
    return this.roleMap[idx].user.name;
  }else{
    return '';
  }
};


Game.prototype.newRound = function() {
  if (this.round_status === roundStatusEnum.FINISH) {
    logger.error('game finshed !');
    return;
  }

  if (this.round_status === roundStatusEnum.President_Power) {
    //logger.error('use President_Power before next Round');
    return;
  }

  this.round++;
  logger.log('new round %d start',this.round);
  this.addLog(`new round ${this.round} start`);

  this.nextPresident();

  logger.log('new President is %s; last_government is %s,%s',
    this.roleMap[this.president_index].user,
    this.indexToName(this.last_government[0]),
    this.indexToName(this.last_government[1]));

  if (this.deck.length < 3) {
    this.deck = _.shuffle(this.drop_deck).concat(this.deck);
    this.drop_deck = [];
  }

  logger.log('deck : %j',this.deck);
  logger.log('drop_deck : %j',this.drop_deck);
  this.setStatus(sEnum.Nominate);
  this.voteMap = {};
  this.hand_deck = [];
  this.chancellor_index = -1;
};

Game.prototype.nextPresident = function() {

  const roleMap = this.roleMap;
  const player_num = this.player_num;
  const _nextPresident = function(now_index) {
    let nextIdx = now_index;
    do{
      nextIdx = (nextIdx + 1) % player_num;
    }while(roleMap[nextIdx].dead);
    return nextIdx;
  };

  if(typeof this.president_index === 'undefined'){
      //very beginning
      logger.log('random start President');
      this.president_index = parseInt(Math.random() * this.player_num);
  }else if (typeof this.forcePresident === 'number') {
    this.lastPresIndex = this.president_index;
    this.president_index = this.forcePresident;
    delete this.forcePresident;
  } else if (typeof this.lastPresIndex === 'number') {
    this.president_index = _nextPresident(this.lastPresIndex);
    delete this.lastPresIndex;
  }else {
    this.president_index = _nextPresident(this.president_index);
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
    if (this.player_num <=5 && this.last_government[0] === nomi_num) {
      logger.log('in five player game,Last President is allow to be choose as Chancellor');
    }else{
      logger.warn('last government member not allowed as new Chancellor');
      return false;
    }
  }

  this.chancellor_index = nomi_num;
  logger.log('%s choose %s as Chancellor, discuss and vote:',user,nomi_user);
  this.addLog( `${user} choose ${nomi_user} as Chancellor`);
  this.setStatus(sEnum.Vote);

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
        this.checkFinish();
        this.setStatus(sEnum.President_Choose);
        this.hand_deck.push(this.deck.pop());
        this.hand_deck.push(this.deck.pop());
        this.hand_deck.push(this.deck.pop());
        logger.log('vote passed!');
        this.addLog('vote passed');
        this.last_government = [this.president_index,this.chancellor_index];
    }else{
      logger.log('vote reject Nominate!');
      this.addLog('vote reject nomi');
      this.election_tracker++;
      if (this.election_tracker === rule.max_election_tracker) {
        this.election_tracker = 0;
        const newPolicyType = this.deck.pop();
        logger.warn('random policy this deck: %j',this.deck);
        this.last_government = [];
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
  this.setStatus(sEnum.Chancellor_Choose);
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

  const target_user = this.roleMap[target_num].user;

  const fascistCnt = this.countFascistPolicy();
  const powerType = rule.powerMap[this.player_num][fascistCnt - 1];
  switch (powerType){
      case rule.powerEnum.skip: 
        logger.warn('no need power');
      break;
      case rule.powerEnum.check: 
        logger.log('user %s check on %s his faction %s',user,target_user,this.roleMap[target_num].role);
      break;
      case rule.powerEnum.trans: 
        logger.warn('user %s trans President to %s',user,target_user);
        this.forcePresident = target_num;
      break;
      case rule.powerEnum.kill: 
        if (target_num === user_num) {
          logger.warn('can not kill youself');
          return false;
        }

        if (this.roleMap[target_num].dead) {
          logger.warn('can not kill dead man!');
          return false;
        }
        logger.warn('user %s kill %s',user,target_user);
        this.roleMap[target_num].dead = true;
        this.checkFinish();
      break;
    default:
      logger.error('error power type');
  }

  this.setStatus(sEnum.Nominate);
  this.newRound();
  return true;
};

Game.prototype.countFascistPolicy = function() {
  let iCount = 0;
  this.published_policy.forEach(function(one,idx){
    if (one === rule.ENUM.Fascist) {
      iCount++;
    }
  });
  return iCount;
};


Game.prototype.checkFinish = function() {
  const fascistCnt = this.countFascistPolicy();

  if (fascistCnt >= rule.fascist_win_cnt) {
    logger.log('Fascist Win!!!');
    this.setStatus(sEnum.FINISH);
  }

  if (this.published_policy.length - fascistCnt >= rule.libera_win_cnt) {
    logger.log('Liberal Win!!!');
    this.setStatus(sEnum.FINISH);
  }

  if (this.roleMap[this.HitlerPlayer].dead) {
    logger.log('Hitler Dead !!!  Liberal Win!!!');
    this.setStatus(sEnum.FINISH);
  }

  if (fascistCnt >= 3 && this.chancellor_index === this.HitlerPlayer) {
    logger.log('Hitler Become Chancellor !!! Fascist Win!!!');
    this.setStatus(sEnum.FINISH);
  }

};

Game.prototype.newPolicy = function(newPolicyType) {
  logger.log('new Policy Published : ' + newPolicyType);
  this.published_policy.push(newPolicyType);
  logger.log('now published : ',this.published_policy);

  const fascistCnt = this.countFascistPolicy();
  const mustPower = rule.powerMap[this.player_num][fascistCnt - 1];

  //random policy can not use power
  if (mustPower && mustPower !== rule.powerEnum.skip && this.last_government.length > 0) {
    this.setStatus(sEnum.President_Power);
  }

  this.checkFinish();

};


module.exports = Game;



