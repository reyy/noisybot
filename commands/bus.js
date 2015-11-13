var request = require('request').defaults({
  strictSSL: false,
  rejectUnauthorized: false
});

const BUSSTOPS = {
    "UTOWN"         : "UTOWN",
    "CLB"           : "CENLIB",
    "OPPCLB"        : "COMCEN",
    "SCIENCE"       : "LT29", //LT27
    "OPPSCIENCE"    : "S17",
    "COM2"          : "COM2",
    "COMPUTING"     : "COM2",
    "KRMRT"         : "KR-MRT",
    "OPPKRMRT"      : "KR-MRT-OPP",
    "AS7"           : "AS7",
    "BIZ2"          : "BIZ2",
    "BGMRT"         : "BG-MRT",
    "BTC"           : "BUKITTIMAH-BTC2",
    "OPPBGMRT"      : "CGH",
    "LT13"          : "LT13",
    "OPPVENTUS"     : "LT13",
    "MUSEUM"        : "MUSEUM",
    "BLKEA"         : "BLK-EA-OPP",
    "I3"            : "HSSML-OPP",
    "OPPBIZ2"       : "HSSML-OPP",
    "NUSS"          : "NUSS-OPP",
    "OPPUHALL"      : "UHALL-OPP",
    "OPPUHC"        : "STAFFCLUB-OPP",
    "OPPYIH"        : "YIH-OPP",
    "PGPR"          : "PGP",
    "PGP"           : "PGPT",
    "RH"            : "RAFFLES",
    "UHALL"         : "UHALL",
    "UHC"           : "STAFFCLUB",
    "VENTUS"        : "LT13-OPP",
    "OPPLT13"       : "LT13-OPP",
    "YIH"           : "YIH"
};

module.exports = function (bot) {
    return function (msg, match) {
        if(match[2] != null && BUSSTOPS[match[2].trim().toUpperCase()] != null)
            fetchIsbTiming(msg.chat.id, bot, BUSSTOPS[match[2].trim().toUpperCase()]);
        else
            showBusMenu(msg, bot);
    }
};

var fetchIsbTiming = function(chatId, bot, code) {
    request('https://nextbus.comfortdelgro.com.sg/eventservice.svc/Shuttleservice?busstopname='+code,
    function (error, response, body) {
        try
        {
            var data = JSON.parse(body);
            var isb = data.ShuttleServiceResult.shuttles;
            var result = "🚍*"+data.ShuttleServiceResult.caption+"*🚍\n";

            for(var i=0; i<isb.length; i++) {
                if(isb[i].arrivalTime != "Arr" && isb[i].arrivalTime != "-" && isb[i].arrivalTime !="N.A")
                    isb[i].arrivalTime += " mins";
                result+= "\n*" + isb[i].name + "* : " + isb[i].arrivalTime;
            }
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown', reply_markup: JSON.stringify({"hide_keyboard": true}) });
        }
        catch(e)
        {
            bot.sendMessage(chatId, "Whoops! Something went wrong :/");
        }
    });
};

var showBusMenu = function(msg, bot) {
    console.log("HERE")
    try{
    var opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            "keyboard": 
                [["/bus UTown", "/bus computing"], 
                ["/bus ventus", "/bus oppClb"], 
                ["/bus i3", "/bus oppScience"], 
                ["/bus KRMRT", "/bus btc"]], 
            "one_time_keyboard": true
            //"force_reply": true
        })
    };

    bot.sendMessage(msg.chat.id, "Please select a bus stop 😁", opts);}
    catch(e){console.log(e)}
}