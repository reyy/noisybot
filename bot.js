var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var https = require('https');
var request = require('request');

const BOT_FILES = {
	MORNING : 'AgADBQADu6cxG6gBDgdA2w9yAugWKTiyszIABDDnqj0Hlyn6bfEAAgI',
	GREETINGS : 'AwADBQADBAADqAEOBzK8hOwVpUFpAg'
}

var token = process.env.OPENSHIFT_TELEGRAM_TOKEN;
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, { webHook: { port: port, host: host } });
bot.setWebHook(domain + ':443/bot' + token);

const getPsi   		= require('./commands/psi')(bot);
const getPrintText  = require('./commands/getPrintText')(bot);

bot.onText(/\/psi(@NoisyBot)?( .+)?/, getPsi);
bot.onTest(/\/echo(@NoisyBot)?( .+)?/,getPrintText);

bot.on('message', function (msg) {
    var cmd = msg.text.split(" ");
    var chatId = msg.chat.id;
    if (cmd[0] == '/morning' || cmd[0] == '/morning@NoisyBot') {
        bot.sendPhoto(chatId, BOT_FILES.MORNING, { caption: "Noisy bot says Good Morning!"});
    }
    else if (cmd[0] == '/greetings' || cmd[0] == '/greetings@NoisyBot') {
        bot.sendAudio(chatId, BOT_FILES.GREETINGS);
    }
    else if (cmd[0] == '/hello' || cmd[0] == '/hello@NoisyBot') {
        bot.sendMessage(chatId, 'HAI guys!');
    }
    else if (cmd[0] == '/help' || cmd[0] == '/help@NoisyBot' || cmd[0] == '/start') {
        var opts = {
            reply_to_message_id: msg.message_id
        };
        bot.sendMessage(chatId, 'Type / to see the commands available! 😁');
    }
    else if (cmd[0] == '/bus' || cmd[0] == '/bus@NoisyBot') {
        try {
            loadBus(chatId);
        }
        catch (e) {
            console.log(e);
            bot.sendMessage(chatId, 'Whoops! Something went wrong :(');
        }
    }
});



var loadBus = function(chatId) {
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

