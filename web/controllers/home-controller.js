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
    this.sendPassword = function(req, res) { self._sendPassword(self, req, res); };
    this.authenticate = function(req, res) { self._authenticate(self, req, res); };
<<<<<<< HEAD
=======
    this.password = function(req, res) { self._password(self, req, res); };
    this.profile = function(req, res) { self._profile(self, req, res); };
    this.postPassword = function(req, res) { self._postPassword(self, req, res); };
    this.resetPasswordGet = function(req, res) { self._resetPasswordGet(self, req, res); };
    this.resetPasswordPost = function(req, res) { self._resetPasswordPost(self, req, res); };
    this.recover = function(req, res) { self._recover(self, req, res); };
>>>>>>> aefdac2380fd884c15941b70698086208bdb91a4
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

<<<<<<< HEAD
=======
//--- recover -----------------------------------------------------------------------
HomeController.prototype._recover = function (self, req, res) {
    res.render("home/recover", {
        loggedIn: req.loggedIn,
        user: req.user,
        message: req.flash("recoverMessage")
    });
};

//--- password -----------------------------------------------------------------------
HomeController.prototype._password = function (self, req, res) {
    if(req.isAuthenticated()){
        i = {};
        i.email = req.user.email;
        i.message = req.flash('passwordMessage');
        res.render("home/password", BD2K.extend(i, {
            loggedIn: req.loggedIn,
            user: req.user
        }));
    }
};

//--- profile -----------------------------------------------------------------------
HomeController.prototype._profile = function (self, req, res) {
    BD2K.solr.search({owners: req.user.email}, function(r){
        res.render('home/profile', {
            loggedIn : req.loggedIn,
            user : req.user, // get the user out of session and pass to template
            message: req.flash('profileMessage'),
            resources: r.response.docs
        });
    })
};



//--- postPassword -----------------------------------------------------------------------
HomeController.prototype._postPassword = function (self, req, res) {
    User.findOne({email: req.body.email}, function (error, user) {
        if (!error && user) {
            user.password = user.generateHash(req.body.new);
            user.save(function () {
                req.flash('profileMessage', 'Password changed successfully.');
                res.redirect('/home/profile');
            });
        }
        else {
            res.redirect('/home/password');
        }
    });
};


>>>>>>> aefdac2380fd884c15941b70698086208bdb91a4
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
                    'http://' + req.headers.host + '/home/authenticate?token=' + user.authenticateToken + '\n\n' +
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

//--- sendPassword -----------------------------------------------------------------------
HomeController.prototype._sendPassword = function (self, req, res) {
    User.findOne({email: req.body.email}, function (error, user) {
        if (!error && user) {
            var token = uuid.v1();
            user.passwordToken = token;
            user.save(function () {
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: 'Aztec <patricktan4@gmail.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Reset Aztec Password', // Subject line
                    text: 'Hi ' + user.firstName + ',\n\n' +
                    'You have requested to reset your password.\n' +
                    'Please reset your password by clicking the link below:\n\n' +
                    'http://' + req.headers.host + '/home/resetPassword?token=' + user.passwordToken + '&email=' + user.email + '\n\n' +
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

                req.flash('loginMessage', 'An email to reset your password has been sent to you.');
                res.redirect('/home/logout');
            });
        }
        else {
            req.flash('recoverMessage', 'Email ' + req.body.email + " not found. Please try again.");
            res.redirect('/home/recover');
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

//--- resetPasswordPost -----------------------------------------------------------------------
HomeController.prototype._resetPasswordPost = function (self, req, res) {
    i = {};
    i.email = req.body.email;
    i.message = req.flash('resettingPasswordMessage');
    i.token = req.query.token;

    User.findOne({passwordToken: req.body.token, email: req.body.email}, function (error, user) {
        if (!error && user) {
            user.password = user.generateHash(req.body.new);
            user.passwordToken = uuid.v1();

            user.save(function() {
                req.flash('loginMessage', 'Password changed successfully.');
                res.redirect('/home/login');
            });
        }
        else{
            res.redirect('/home/failure')
        }
    });
};

//--- resetPasswordGet -----------------------------------------------------------------------
HomeController.prototype._resetPasswordGet = function (self, req, res) {
    i = {};
    i.email = req.query.email;
    i.message = req.flash('resettingPasswordMessage');
    i.token = req.query.token;

    User.findOne({passwordToken: req.query.token, email: req.query.email}, function (error, user) {
        if (!error && user) {
            res.render('home/resetPassword', BD2K.extend(i, {
                loggedIn: req.loggedIn,
                user: req.user
            }));
        }
        else{
            res.redirect('/home/failure')
        }
    });
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new HomeController();
