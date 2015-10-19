var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var https = require('https');
var request = require('request');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

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
    else if (cmd[0] == '/psi' || cmd[0] == '/psi@NoisyBot') {
        try {
    		if(cmd[1] == '3hr' || cmd[1] == '3Hr')
            	loadPSI(chatId);
            else
            	load1HourPSI(chatId);
        }
        catch (e) {
            bot.sendMessage(chatId, 'Whoops! Cant get PSI now');
        }
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
    else if (cmd[0] == '/echo' || cmd[0] == '/echo@NoisyBot') {
        var text = msg.text.replace("/echo@NoisyBot","");
        text = text.replace("/echo","");
        try{
            loadEcho(chatId, encodeURIComponent(text));
        }
        catch(e) {
            console.log(e);
            bot.sendMessage(chatId, 'Whoops! Something went wrong :(');
        }
    }
}
    );

var loadPSI = function (chatId) {
    http.get({
        host: 'www.nea.gov.sg',
        path: '/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA8231CCC0BE0A547FEEC6'
    }, function (response) {
        var body = '';
        response.on('data', function (d) {
            body += d;
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
            	try{
	                var doc = new dom().parseFromString(body)

	                var west = xpath.select("//region[id='rWE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                var east = xpath.select("//region[id='rEA']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                var central = xpath.select("//region[id='rCE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                var south = xpath.select("//region[id='rSO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                var north = xpath.select("//region[id='rNO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                var avg = xpath.select("//region[id='NRS']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
	                //var time = xpath.select("//region[id='NRS']/record/@timestamp",doc);
	                var result = "😷*[Current 3Hr PSI]*😷\nWest : " + west[0].nodeValue + "\nEast : " + east[0].nodeValue + "\nSouth : " + south[0].nodeValue + "\nNorth : " + north[0].nodeValue + "\nCentral : " + central[0].nodeValue + "\n\nNational Avg : " + avg[0].nodeValue;
	                result += "\n\n_Note: This is the 3 hour average PSI. For 1 hour PSI (calculated from NEA data), type /psi_"

	                bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
	            } catch (e) {
	            	bot.sendMessage(chatId, "*Whoop!* 😳 Unable to get PSI now. Please try again later or use /psi to get the 1 hour PSI.", { parse_mode: 'Markdown' });
	            }
            });

        });

    });
}

var load1HourPSI = function(chatId) {
    var options = {
        host: 'spreadsheets.google.com',
        port: 443,
        path: '/feeds/list/1iihowhAfN1j2AqMX31gYxjvmg0P477ZPf6FTVKmBxWU/5/public/values?alt=json',
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
            var psi = data.feed.entry[0];
            var result = "😷*[Current Calculated 1Hr PSI]*😷\nWest : " + psi['gsx$west']['$t'] + "\nEast : " + psi['gsx$east']['$t'] + "\nSouth : " + psi['gsx$south']['$t'] + "\nNorth : " + psi['gsx$north']['$t'] + "\nCentral : " + psi['gsx$central']['$t'] + "\n\nNational Avg : " + psi['gsx$average']['$t'];

            result += "\n\n_Note: This is the 1 hour PSI (calculated from NEA data). For 3 hour average PSI, type /psi 3hr_";
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
        });
    });

    req.on('error', function(err) {
        console.log('error: ' + err.message);
        bot.sendMessage(chatId, "Uh oh! Something went wrong :(", { parse_mode: 'Markdown' });
    });

    req.end();
};

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

var loadEcho = function (chatId, text) {
    http.get({
        host: 'api.img4me.com',
        path: '/?text=%0A'+text+'%0A&font=impact&fcolor=FFFFFF&size=35&bcolor=FA1616&type=jpg'
    }, function (response) {
        var body = '';
        response.on('data', function (d) {
            body += d;
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
                bot.sendPhoto(chatId, request(body));
            });

        });

    });
}