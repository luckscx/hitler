"use strict";

const underscore = require('underscore');
const rule = {};

const roleIndex = {
  Liberals : 0,
  Fascists : 1,
  Hitler   : 2
};

const L = roleIndex.Liberals;
const F = roleIndex.Fascists;
const H = roleIndex.Hitler;

rule.roleMap = {
  '5'  : [L,L,L,F,H],
  '6'  : [L,L,L,F,F,H],
  '7'  : [L,L,L,L,F,F,H],
  '8'  : [L,L,L,L,L,F,F,H],
  '9'  : [L,L,L,L,L,F,F,F,H],
  '10' : [L,L,L,L,L,L,F,F,F,H],
};

const LiberaCnt = 6;
const FascistCnt = 11;
let deck = [];
for (let i = 0; i < LiberaCnt ; ++i ) {
  deck.push(0);
}
for (let i = 0; i < FascistCnt ; ++i ) {
  deck.push(1);
}

rule.initDeck = function() {
  return underscore.shuffle(deck);
};


module.exports = rule;



