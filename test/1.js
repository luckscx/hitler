"use strict";

// open room , join , start game


const roomMgr = require('../lib/roomMgr');


var assert = require('assert');
describe('room', function() {
  const user_id = 123;
  const config = {
    player_num : 5
  };
  const room_one = roomMgr.new(user_id,config);
  console.log(room_one);
  describe('#new', function() {
    it('check params', () => {
      assert.equal(room_one.own_id,user_id);
    });
    it('start false', () => {
      assert.equal(room_one.start(),false);
    });
    it('join', () => {
      assert.equal(room_one.start(),false);
    });
  });
});









