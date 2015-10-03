var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var token = process.env.OPENSHIFT_TELEGRAM_TOKEN;
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
bot.setWebHook(domain+':443/bot'+token);

bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  if (msg.text == '/morning' || msg.text == '/morning@NoisyBot') {
    var photo = 'morning.jpg';
    bot.sendPhoto(chatId, photo, {caption: "Noisy bot says HAI!"});
  }
  else if (msg.text == '/hello' || msg.text == '/hello@NoisyBot') {
    bot.sendMessage(chatId, 'HAI guys!', opts);
  }
  else if (msg.text == '/help' || msg.text == '/help@NoisyBot') {
    var opts = {
      reply_to_message_id: msg.message_id
    };
    bot.sendMessage(chatId, 'Type /hello or /morning 😁');
  }
  else if(msg.text =='/psi' || msg.text =='/psi@NoisyBot') {
    try{
      http.get({
    host: 'www.nea.gov.sg',
    path: '/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA8231CCC0BE0A547FEEC6'
  }, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
  console.log("resp");

        var doc = new dom().parseFromString(body)

        var west = xpath.select("//region[id='rWE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var east = xpath.select("//region[id='rEA']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var central = xpath.select("//region[id='rCE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var south = xpath.select("//region[id='rSO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var north = xpath.select("//region[id='rNO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var avg = xpath.select("//region[id='NRS']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        //var time = xpath.select("//record/@timestamp",doc);
        var result = "😷[Current 3Hr PSI] 😷\nWest : "+west[0].nodeValue+"\nEast : "+east[0].nodeValue+"\nSouth : "+south[0].nodeValue+"\nNorth : "+north[0].nodeValue+"\nCentral : "+central[0].nodeValue+"\n\nNational Avg : "+avg[0].nodeValue;
      bot.sendMessage(chatId, result, opts);
      });

});

});

    
    }
    catch(e) {
      bot.sendMessage(chatId, 'Whoops! Cant get PSI now' , opts);
    }
  }
}
);

var loadPSI = function(){
  var result ="-";
  http.get({
    host: 'www.nea.gov.sg',
    path: '/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA8231CCC0BE0A547FEEC6'
  }, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
	console.log("resp");

        var doc = new dom().parseFromString(body)

        var west = xpath.select("//region[id='rWE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var east = xpath.select("//region[id='rEA']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var central = xpath.select("//region[id='rCE']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var south = xpath.select("//region[id='rSO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var north = xpath.select("//region[id='rNO']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
        var avg = xpath.select("//region[id='NRS']/record/reading[@type='NPSI_PM25_3HR']/@value", doc)
//        var time = xpath.select("//record/@timestamp",doc);
        result = "[Current 3Hr PSI - "+/*time[0].nodeValue+*/"]\nWest : "+west[0].nodeValue+"\nEast : "+east[0].nodeValue+"\nSouth : "+south[0].nodeValue+"\nNorth : "+north[0].nodeValue+"\nCentral : "+central[0].nodeValue+"\n\nNational Avg : "+avg[0].nodeValue;
console.log("res"+result);
      });

});

});
return result;
}

