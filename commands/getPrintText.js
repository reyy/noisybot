const http = require('http');

module.exports = function (bot) {
    return function (msg, match) {
        loadEcho(match[2]);
    }
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