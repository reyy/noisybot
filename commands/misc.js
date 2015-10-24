const BOT_FILES = {
    MORNING : 'AgADBQADu6cxG6gBDgdA2w9yAugWKTiyszIABDDnqj0Hlyn6bfEAAgI',
    GREETINGS : 'AwADBQADBAADqAEOBzK8hOwVpUFpAg'
}

var functions = module.exports = {};
var bot = null;

module.exports = function (telegramBot) {
    bot = telegramBot;
    return functions;
}.bind(this);

functions.morning = function(msg, match) {
    bot.sendPhoto(msg.chat.id, BOT_FILES.MORNING, { caption: "Noisy bot says Good Morning!"});
}

functions.hello = function(msg, match) {
    bot.sendMessage(msg.chat.id, 'HAI guys!', {reply_to_message_id: msg.message_id});
}

functions.greetings = function(msg, match) {
    bot.sendAudio(msg.chat.id, BOT_FILES.GREETINGS);
}

functions.help = function(msg, match) {
    bot.sendMessage(msg.chat.id, 'Type / to see the commands available! 😁');
}