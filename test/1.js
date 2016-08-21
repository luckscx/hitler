"use strict";

// open room , join , start game

const should = require('should/as-function');
const Room = require('../lib/room');
const User = require('../lib/user');



var assert = require('assert');
describe('room', function() {
  const owner = new User('grissom');
  const config = {
    player_num : 5
  };
  const room_one = new Room(owner,config);
  const room_two = new Room(owner,config);
  console.log(room_one);
  describe('#new', function() {
    it('check room_id', () => {
      should(room_two.room_id).be.exactly(2);
      should(room_one.room_id).be.exactly(1);
    });
    it('start false', () => {
      should(room_one.start()).be.exactly(false);
    });
    it('join', () => {
      const echo = new User('Echo');
      const alec = new User('Alec');
      const pan = new User('Pan');
      const pinky = new User('Pinky');
      room_one.join(echo);
      room_one.join(alec);
      room_one.join(pan);
      room_one.join(pinky);
      should(room_one.room_player).containDeep([owner,echo,alec,pan,pinky]);
    });
    it('start ok', () => {
      should(room_one.start()).be.exactly(true);
    });
  });
});









