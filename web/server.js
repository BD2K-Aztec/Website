var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/app.json');
var HomeController = require('./controllers/home-controller.js');
var ResourceController = require('./controllers/resource-controller.js');
var ToolController = require('./controllers/tool-controller.js');
var favicon = require('serve-favicon');

//*********************************************************************************
//  init
//*********************************************************************************

http.createServer(app);

app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/images/bd2k.ico'));

//*********************************************************************************
//  route
//*********************************************************************************

app.get('/', HomeController.index);
app.get('/home/index', HomeController.index);

app.get('/resource/raw', ResourceController.raw);
app.get('/resource/advanced', ResourceController.advanced);
app.get('/resource/search', ResourceController.search);
app.get('/resource/update', ResourceController.update);
app.get('/resource/stat', ResourceController.stat);
app.get('/resource/add', ResourceController.add);

app.get('/tool/filters', ToolController.filters);
app.get('/tool/show', ToolController.show);
app.get('/tool/create', ToolController.create);
app.get('/tool/edit', ToolController.edit);

//*********************************************************************************
//  run
//*********************************************************************************

var port = config.serverPort;
app.listen(port);

console.log("server up and running on port " + port);