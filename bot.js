var TelegramBot = require('node-telegram-bot-api');

var token = process.env.OPENSHIFT_TELEGRAM_TOKEN;
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain+':443/bot'+token);

bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  if (msg.text == '/morning') {
    // From file
    var photo = 'morning.jpg';
    bot.sendPhoto(chatId, photo, {caption: "Noisy bot says HAI!"});
  }
  else if (msg.text == '/hello') {
    bot.sendMessage(chatId, 'HAI guys!', opts);
  }
  else if (msg.text == '/help') {
    var opts = {
      reply_to_message_id: msg.message_id
    };
    bot.sendMessage(chatId, 'Type /hello or /morning 😁', opts);
  }
});
