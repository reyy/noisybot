const request = require('request');

module.exports = function (bot) {
    return function (msg, match) {
        loadEcho(msg.chat.id, match[2], bot);
    }
};

var loadEcho = function (chatId, text, bot) {
    request('http://api.img4me.com/?text=%0A' + text + '%0A&font=impact&fcolor=FFFFFF&size=35&bcolor=FA1616&type=jpg', 
        function (error, response, body) {
        if (!error && response.statusCode == 200)
            bot.sendPhoto(chatId, request(body));
        else
            bot.sendText(chatId, "Whoops! Something went wrong :/");
    })
}
