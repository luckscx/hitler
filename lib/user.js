"use strict";


const uuid = require('uuid');
const underscore = require('underscore');

const defaultName = ['Grissom','Echo','Pinky','Alec', 'Pan','Serena','Claude','Maple','Ender','Figo','Lampard','Rita'];

let User = function(name) {
  this.id = uuid.v4();
  this.name = name || underscore.sample(defaultName);
};

User.prototype.changeName = function(newName) {
  this.name = newName;
};

User.prototype.toString = function() {
  return `${this.name}[${this.id.split('-')[4]}]`;
};

if(require.main === module){
  const user = new User();
  console.log("%s",user);
}


module.exports = User;



