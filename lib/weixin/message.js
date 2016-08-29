"use strict";

const template = require('ect');
const path = require('path');
const weixin_util = require('./util');

const renderer = template({
  root: path.join(__dirname, 'template')
});

let xmlMaker = {
  _xml: function(from, to, type, data) {
    if (['text', 'image', 'voice', 'video', 'news', 'music'].indexOf(type) !== -1) {
      var _ = require('lodash');
      var options = _.extend({
        from: from,
        to: to,
        time: new Date().getTime(),
        type: type
      }, data);
      return renderer.render(type + '.ect', options);
    }
  },
  text: function(from, to, content) {
    return this._xml(from, to, 'text', {
      content: content
    });
  },
  image: function(from, to, mediaId) {
    return this._xml(from, to, 'image', {
      mediaId: mediaId
    });
  },
  voice: function(from, to, mediaId) {
    return this._xml(from, to, 'voice', {
      mediaId: mediaId
    });
  },
  video: function(from, to, mediaId, title, desc) {
    return this._xml(from, to, 'video', {
      mediaId: mediaId,
      title: title,
      description: desc
    });
  },
  music: function(from, to, mediaId, title, desc, url, hqUrl) {
    return this._xml(from, to, 'music', {
      mediaId: mediaId,
      title: title,
      description: desc,
      url: url,
      hqUrl: hqUrl
    });
  },
  news: function(from, to, articles) {
    return this._xml(from, to, 'news', {
      articles: articles
    });
  }
};


let message = {
  sendCustom : function(open_id,text) {
    if (open_id.length > 10) {
      // http请求方式: POST
      // https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=ACCESS_TOKEN
      const options = {
        method : 'POST',
        uri : 'message/custom/send',
        qs : {},
        body : {
          "touser": open_id,
          "msgtype":"text",
          "text": {
            "content": text
          }
        }
      }
      weixin_util.request(options,function(err,result) {
        console.log(result);
      });
    }
  }
}

if(require.main === module){
  //const str = xmlMaker.text('aaa','bbb','ccc');
  //console.log(str);
  message.sendCustom('o_xpvuI9EqdLkHSPPgLjTw8EZnyU','aaa');
}


module.exports = message;
