var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var configDB = require('./config/database.js');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/app.json');
var favicon = require('serve-favicon');

mongoose.connect(configDB.url); // connect to our database

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
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//*********************************************************************************
//  route
//*********************************************************************************
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//*********************************************************************************
//  run
//*********************************************************************************

var port = config.serverPort; // fix it back to config.serverPort before uploading
app.listen(port);

console.log("server up and running on port " + port);
