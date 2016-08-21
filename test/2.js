"use strict";

// open room , join , start game

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
  describe('#game', function() {
    it('get game info', () => {
      room_one.showInfo();
    });
  });
});









