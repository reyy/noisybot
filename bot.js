var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var https = require('https');
var request = require('request');


var token = process.env.OPENSHIFT_TELEGRAM_TOKEN;
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, { webHook: { port: port, host: host } });
bot.setWebHook(domain + ':443/bot' + token);

const getPrintText  = require('./commands/getPrintText')(bot);
const getTextToImg  = require('./commands/textToImg')(bot);
const getMisc  		= require('./commands/misc')(bot);
const getPsi   		= require('./commands/psi')(bot);

bot.onText(/\/echo(@NoisyBot)?( .+)?/,getTextToImg);
bot.onText(/\/psi(@NoisyBot)?( .+)?/, getPsi);

bot.onText(/\/greetings(@NoisyBot)?/, getMisc.greetings);
bot.onText(/\/morning(@NoisyBot)?/, getMisc.morning);
bot.onText(/\/hello(@NoisyBot)?/, getMisc.hello);
bot.onText(/\/help(@NoisyBot)?/, getMisc.help);
bot.onText(/\/start(@NoisyBot)?/, getMisc.help);

bot.on('message', function (msg) {
    var cmd = msg.text.split(" ");
    var chatId = msg.chat.id;
    if (cmd[0] == '/bus' || cmd[0] == '/bus@NoisyBot') {
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

