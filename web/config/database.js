// config/database.js
var config = require('./app.json');
var util = require('../utility/bd2k');

var host = config.mongoHost;
var port = config.mongoPort;
var username = util.decrypt('user', config.mongoUsername);
var password = util.decrypt('password', config.mongoPassword);
module.exports = {

    'url' : 'mongodb://'+username+':'+password+'@'+ host + ':' + port  + '/BD2K' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};
