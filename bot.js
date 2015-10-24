var TelegramBot = require('node-telegram-bot-api');

var token = process.env.OPENSHIFT_TELEGRAM_TOKEN;
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, { webHook: { port: port, host: host } });
bot.setWebHook(domain + ':443/bot' + token);

const getTextToImg  = require('./commands/textToImg')(bot);
const getMisc  		= require('./commands/misc')(bot);
const getPsi   		= require('./commands/psi')(bot);
const getBus   		= require('./commands/bus')(bot);

bot.onText(/\/echo(@NoisyBot)?( .+)?/,getTextToImg);
bot.onText(/\/psi(@NoisyBot)?( .+)?/, getPsi);
bot.onText(/\/bus(@NoisyBot)?/, getBus);

bot.onText(/\/greetings(@NoisyBot)?/, getMisc.greetings);
bot.onText(/\/morning(@NoisyBot)?/, getMisc.morning);
bot.onText(/\/hello(@NoisyBot)?/, getMisc.hello);
bot.onText(/\/help(@NoisyBot)?/, getMisc.help);
bot.onText(/\/start(@NoisyBot)?/, getMisc.help);