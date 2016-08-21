"use strict";

const underscore = require('underscore');
const rule = {};

const roleIndex = {
  Liberal : 0,
  Fascist : 1,
  Hitler   : 2
};

rule.ENUM = roleIndex;

const L = roleIndex.Liberal;
const F = roleIndex.Fascist;
const H = roleIndex.Hitler;

rule.roleMap = {
  '5'  : [L,L,L,F,H],
  '6'  : [L,L,L,F,F,H],
  '7'  : [L,L,L,L,F,F,H],
  '8'  : [L,L,L,L,L,F,F,H],
  '9'  : [L,L,L,L,L,F,F,F,H],
  '10' : [L,L,L,L,L,L,F,F,F,H],
};

const powerEnum = {
  skip : -1,
  check : 0,
  trans : 1,
  watch : 2,
  kill  : 3
};

rule.powerEnum = powerEnum;

const skip = powerEnum.skip;
const check = powerEnum.check;
const trans = powerEnum.trans;
const watch = powerEnum.watch;
const kill = powerEnum.kill;

rule.powerMap = {
  '5'  : [skip,skip,watch,kill,kill],
  '6'  : [skip,skip,watch,kill,kill],
  '7'  : [skip,check,trans,kill,kill],
  '8'  : [skip,check,trans,kill,kill],
  '9'  : [check,check,trans,kill,kill],
  '10'  : [check,check,trans,kill,kill]
};

rule.max_election_tracker = 3;

const LiberaCnt = 6;
const FascistCnt = 11;
let deck = [];
for (let i = 0; i < LiberaCnt ; ++i ) {
  deck.push(roleIndex.Liberal);
}
for (let i = 0; i < FascistCnt ; ++i ) {
  deck.push(roleIndex.Fascist);
}

rule.initDeck = function() {
  return underscore.shuffle(deck);
};

rule.fascist_win_cnt = 6;
rule.libera_win_cnt = 5;


module.exports = rule;



