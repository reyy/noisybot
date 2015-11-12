const request = require('request');

module.exports = function (bot) {
    return function (msg, match) {
        loadSay(msg, match[2], bot);
    }
};

var loadSay = function (msg, data, bot) {
    var baseURL = 'http://www.voicerss.org/controls/speech.ashx?hl=en-in&src='+data+'&c=ogg&rnd='+Math.random();

    options = {};
    options.url = baseURL;
    options.encoding = null;

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        bot.sendVoiceSpecial(msg.chat.id, body); //Requires my modified version of telegram-bot-api
      } else {
        bot.sendMessage(msg,chat.id, "Whoops! Something went wrong :/");
      }
    });

}
