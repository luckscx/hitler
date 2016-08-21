"use strict";

// open room , join , start game

const _ = require('underscore');
const should = require('should/as-function');
const Room = require('../lib/room');
const User = require('../lib/user');
const logger = require('tracer').colorConsole();

var assert = require('assert');
describe('room', function() {
  const owner = new User('grissom');
  const config = {
    player_num : 6
  };
  const room_one = new Room(owner,config);
  logger.log(room_one);
  const echo = new User('Echo');
  const alec = new User('Alec');
  const pan = new User('Pan');
  const pinky = new User('Pinky');
  const maple = new User('Maple');
  room_one.join(echo);
  room_one.join(alec);
  room_one.join(pan);
  room_one.join(pinky);
  room_one.join(maple);
  room_one.start();
  const game = room_one.game;
  function oneRound() {
    describe('#game', function() {
      it('nominate ', () => {
        room_one.showInfo();
        const randPick = _.sample(_.without(_.range(game.player_num),game.president_index));
        const res = game.nominate(game.president_index,randPick);
        should(res).be.true();
      });
      it('vote ', () => {
        for (let i = 0, len = game.player_num; i < len; ++i ) {
          const res = game.vote(i,true);
        }
      });
      it('presend drop ', () => {
        const dropCard = _.sample(game.hand_deck);
        game.presidentChoose(game.president_index,dropCard);
      });
      it('chanceller drop ', () => {
        const dropCard = _.sample(game.hand_deck);
        game.chancellorChoose(game.chancellor_index,dropCard);
      });
    });
  }

  for (let i = 0, len = 8; i < len; ++i ) {
    oneRound();
  }
});









