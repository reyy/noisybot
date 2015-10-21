const http = require('http');
const https = require('https');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

module.exports = function (bot) {
    return function (msg, match) {
        if(match[2] == ' 3hr' || match[2] == ' 3Hr')
            loadPSI(msg.chat.id, bot);
        else
            load1HourPSI(msg.chat.id, bot);
    }
};

var loadPSI = function (chatId, bot) {
    http.get({
        host: 'www.nea.gov.sg',
        path: '/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA8231CCC0BE0A547FEEC6',
        method: 'GET',
        headers: {'Content-Type': 'application/xml'}
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

var load1HourPSI = function(chatId, bot) {
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