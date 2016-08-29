
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

//let eventMgr = {
  //emit : function(type,obj) {
    //myEmitter.emit('e'+type,obj);
  //},
  //listen : function(type,func) {
    //myEmitter.on('e'+type)
    
  //}
//};

module.exports = myEmitter;
