// config/database.js
var config = require('./app.json');

var host = config.mongoHost;
var port = config.mongoPort;
module.exports = {

    'url' : 'mongodb://' + host + ':' + port  + '/BD2K' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};