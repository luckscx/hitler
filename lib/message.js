
const eventMgr = require('./eventMgr');

let message = {
  parse : function(req,body) {
    const msgtype = body.msgtype[0];
    logger.log('%j',body);
    switch (msgtype){
        case 'text': 
          this.textParse(req,body);
        break;
        case 'event': 
          this.eventParse(req,body);
        break;
      default:
        logger.error('not support msgtype %s',msgtype);
    }
  },
  textParse : function(req,body) {
    const content = body.content;
    if ( + content > 0 ) {
      eventMgr.emit('join_room',req.user, + content);
    }
  },
  eventParse : function(req,body) {
    logger.log(body.eventkey[0]);
    const eventkey = body.eventkey[0];
    switch (eventkey){
        case 'new_room': 
        eventMgr.emit('new_room',req.user,{});
        break;
        case 'join_room': 
        eventMgr.emit('new_room',req.user);
        break;
      default:
        console.error('not support event',eventkey);
    }
  }
};

module.exports = message;
