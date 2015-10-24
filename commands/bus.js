const https = require('https');

module.exports = function (bot) {
    return function (msg, match) {
        loadBus(msg.chat.id, bot);
    }
};

var loadBus = function(chatId, bot) {
    var options = {
        host: 'nextbus.comfortdelgro.com.sg',
        port: 443,
        path: '/eventservice.svc/Shuttleservice?busstopname=UTOWN',
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        rejectUnauthorized: false  
    };

    var req = https.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var data = JSON.parse(output);
            var isb = data.ShuttleServiceResult.shuttles;
            var result = "🚍*"+data.ShuttleServiceResult.caption+"*🚍";

            for(var i=0; i<isb.length; i++) {
                if(isb[i].arrivalTime != "Arr")
                    isb[i].arrivalTime += " mins";
                result+= "\n*" + isb[i].name + "* : " + isb[i].arrivalTime;
            }
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
        });
    });

    req.on('error', function(err) {
        console.log('error: ' + err.message);
        bot.sendMessage(chatId, "Uh oh! Something went wrong :(", { parse_mode: 'Markdown' });
    });

    req.end();
};