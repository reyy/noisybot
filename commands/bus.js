var request = require('request').defaults({
  strictSSL: false,
  rejectUnauthorized: false
});

module.exports = function (bot) {
    return function (msg, match) {
        loadBus(msg.chat.id, bot);
        
    }
};

var loadBus = function(chatId, bot) {
    request('https://nextbus.comfortdelgro.com.sg/eventservice.svc/Shuttleservice?busstopname=UTOWN',
    function (error, response, body) {

        if (!error && response.statusCode == 200)
        {
            var data = JSON.parse(body);
            var isb = data.ShuttleServiceResult.shuttles;
            var result = "🚍*"+data.ShuttleServiceResult.caption+"*🚍";

            for(var i=0; i<isb.length; i++) {
                if(isb[i].arrivalTime != "Arr")
                    isb[i].arrivalTime += " mins";
                result+= "\n*" + isb[i].name + "* : " + isb[i].arrivalTime;
            }
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
        }
        else
            bot.sendMessage(chatId, "Whoops! Something went wrong :/");
    });
};