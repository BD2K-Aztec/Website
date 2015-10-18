//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  HomeController
//
var User = require('../models/user.js');
var uuid = require('uuid');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'admin@bd2kcc.org',
        pass: '2eyxv2ewbr'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

function HomeController() {
    var self = this;

    this.index = function(req, res) { self._index(self, req, res); };
    this.success = function(req, res) { self._success(self, req, res); };
    this.failure = function(req, res) { self._failure(self, req, res); };
    this.overview = function(req, res) { self._overview(self, req, res); };
    this.metadata = function(req, res) { self._metadata(self, req, res); };
    this.technologies = function(req, res) { self._technologies(self, req, res); };
    this.sources = function(req, res) { self._sources(self, req, res); };
    this.signup = function(req, res) { self._signup(self, req, res); };
    this.authenticate = function(req, res) { self._authenticate(self, req, res); };
}

//--- index -----------------------------------------------------------------------
HomeController.prototype._index = function (self, req, res) {
    res.render("home/index");
};

//--- success -----------------------------------------------------------------------
HomeController.prototype._success = function (self, req, res) {
    res.render("home/success");
};

//--- failure -----------------------------------------------------------------------
HomeController.prototype._failure = function (self, req, res) {
    res.render("home/failure");
};

//--- overview -----------------------------------------------------------------------
HomeController.prototype._overview = function (self, req, res) {
    res.render("home/overview");
};

//--- metadata -----------------------------------------------------------------------
HomeController.prototype._metadata = function (self, req, res) {
    res.render("home/metadata");
};

//--- technologies -----------------------------------------------------------------------
HomeController.prototype._technologies = function (self, req, res) {
    res.render("home/technologies");
};

//--- sources -----------------------------------------------------------------------
HomeController.prototype._sources = function (self, req, res) {
    res.render("home/sources");
};

//--- signup -----------------------------------------------------------------------
HomeController.prototype._signup = function (self, req, res) {
    User.findOne({email: req.body.email}, function (error, user) {
        if (!error && user) {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            var token = uuid.v1();
            user.authenticateToken = token;
            user.save(function () {
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: 'Aztec <patricktan4@gmail.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Authenticate Aztec Account', // Subject line
                    text: 'Hi ' + user.firstName + ',\n\n' +
                    'You have created an Aztec account.\n' +
                    'Please authenticate your account by clicking the link below:\n\n' +
                    'http://' + req.headers.host + '/home/authenticate?token=' + user.token + '\n\n' +
                    'Thanks!\n\n' +
                    'Aztec.bio'
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);

                });

                res.redirect('/home/profile');
            });
        }
        else {
            res.redirect('/home/signup');
        }
    });
};

//--- authenticate -----------------------------------------------------------------------
HomeController.prototype._authenticate = function (self, req, res) {
    var token = req.query.token;
    User.findOne({authenticateToken: token}, function (error, user) {
        if (!error && user) {
            user.authenticated = true;
            user.save(function () {
                res.redirect('/home/success');
            });
        }
        else{
            res.redirect('/home/failure')
        }
    });
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new HomeController();
