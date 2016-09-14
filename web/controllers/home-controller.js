var User = require('../models/mongo/user.js');
var Feedback = require('../models/mongo/feedback.js');
var BD2K = require('../utility/bd2k.js');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var google_api_key = require('./secret.json');


// create reusable transporter object using SMTP transport (automated emails)
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'admin@bd2kcc.org',
        pass: '2eyxv2ewbr'
    }
});

/**
 * @class HomeController
 * @constructor
 * @classdesc Controller for index pages, profile management, and about pages.
 */
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
    this.password = function(req, res) { self._password(self, req, res); };
    this.profile = function(req, res) { self._profile(self, req, res); };
    this.postPassword = function(req, res) { self._postPassword(self, req, res); };
    this.resetPasswordGet = function(req, res) { self._resetPasswordGet(self, req, res); };
    this.resetPasswordPost = function(req, res) { self._resetPasswordPost(self, req, res); };
    this.recover = function(req, res) { self._recover(self, req, res); };
    this.changelog = function(req, res) {self._changelog(self, req, res) ; };
    this.feedback = function(req, res) {self._feedback(self, req, res) ; };
}

/**
 * Controller function for index page. Contains initial google Oauth for Google Analytics)
 * @memberof HomeController
 * @function
 * @alias index
 */
HomeController.prototype._index = function (self, req, res) {
    var SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
    var jwtClient = new google.auth.JWT(google_api_key.client_email, null, google_api_key.private_key, [SCOPE, SCOPE], null);

    jwtClient.authorize(function(err, tokens) {
        //console.log("jwt: "  + JSON.stringify(jwtClient));

        if (err) throw err;

        res.render("home/index", {
            loggedIn: req.loggedIn,
            user: req.user,
            authorizationToken: jwtClient["credentials"]["access_token"]
        });

    });

};

/**
 * Controller function for success page. Shown when user actions are successful
 * @memberOf HomeController
 * @function
 * @alias success
 */
 HomeController.prototype._success = function (self, req, res) {
    res.render("home/success", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for failure page. Shown when user actions fail
 * @memberOf HomeController
 * @function
 * @alias failure
 */
 HomeController.prototype._failure = function (self, req, res) {
    res.render("home/failure", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for overview page. Shows the overview about page.
 * @memberOf HomeController
 * @function
 * @alias overview
 */
 HomeController.prototype._overview = function (self, req, res) {
    res.render("home/overview", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for metadata page. Shows the metadata about page.
 * @memberOf HomeController
 * @function
 * @alias metadata
 */
 HomeController.prototype._metadata = function (self, req, res) {
    res.render("home/metadata", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for technologies page. Shows the technologies about page.
 * @memberOf HomeController
 * @function
 * @alias technologies
 */
HomeController.prototype._technologies = function (self, req, res) {
    res.render("home/technologies", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for sources page. Shows the sources about page.
 * @memberOf HomeController
 * @function
 * @alias sources
 */
HomeController.prototype._sources = function (self, req, res) {
    res.render("home/sources", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for changelog page.
 * @memberOf HomeController
 * @function
 * @alias changelog
 */
HomeController.prototype._changelog = function (self, req, res) {
    res.render("home/changelog", {
        loggedIn: req.loggedIn,
        user: req.user
    });
};

/**
 * Controller function for profile recovery page.
 * @memberOf HomeController
 * @function
 * @alias recover
 * @param {String} recoverMessage - flash message to inform user about recovery state
 */
HomeController.prototype._recover = function (self, req, res) {
    res.render("home/recover", {
        loggedIn: req.loggedIn,
        user: req.user,
        message: req.flash("recoverMessage")
    });
};

/**
 * Controller function to change user password.
 * @memberOf HomeController
 * @function
 * @alias password
 * @param {String} passwordMessage - flash message to inform user about password change state
 * @param {String} email - user email
 */
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

/**
 * Controller function for profile page.
 * @memberOf HomeController
 * @function
 * @alias profile
 * @param {String} email - user email
 * @param {String} profileMessage - Used to alert user of success or failure of authentication or password change.
 * @param {Array} docs - List of tools owned by the user
 */
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

/**
 * Controller function for password page. Page shown after [password()]{@link password}, showing success or failure of password change.
 * @memberOf HomeController
 * @function
 * @alias postPassword
 * @param {String} profileMessage - contains result of attempted password change
 * @param {String} password - User's new password
 * @param {String} email - User's email
 */
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

/**
 * Controller function for signup page. Page shown after [password()]{@link password}, showing success or failure of password change.
 * @memberOf HomeController
 * @function
 * @alias signup
 * @param {String} profileMessage - contains result of attempted password change
 * @param {String} password - User's new password
 * @param {String} email - User's email
 */
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
                    from: 'Aztec <admin@bd2kcc.org>', // sender address
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

                req.flash('loginMessage', 'Please authenticate your account. An email has been sent to you.');
                res.redirect('/home/logout');
            });
        }
        else {
            res.redirect('/home/signup');
        }
    });
};

 /**
 * Controller function for sendPassword. Function is run when a user enters email in the [recover()]{@link recover} page. 
 *     Sends an email to the user containing a token to access a password reset page.
 * @memberOf HomeController
 * @function
 * @alias sendPassword
 * @param {String} loginMessage - message to show when redirected to the login page (token sent successfully)
 * @param {String} email - User's email
 * @param {String} recoverMessage - message to show when redirected to the recover page (email isn't found)
 */

HomeController.prototype._sendPassword = function (self, req, res) {
    User.findOne({email: req.body.email}, function (error, user) {
        if (!error && user) {
            var token = uuid.v1();
            user.passwordToken = token;
            user.save(function () {
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: 'Aztec <admin@bd2kcc.org>', // sender address
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

/**
 * Controller function for user authentication. User arrives here after following authentication email. 
 * Redirects to either a success or failure page depending on result.
 * @memberOf HomeController
 * @function
 * @alias authenticate
 * @param {String} token - token sent to the user's email from [signup()]{@link signup}
 */
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

/**
 * Controller function for resetPasswordPost. Result page after [resetPasswordGet()]{@link resetPasswordGet}.
 * Rechecks the user's token and then replaces the user's password in the mongo database with a hashed password. 
 * @memberOf HomeController
 * @function
 * @alias resetPasswordPost
 * @param {String} token - token sent to the user's email from [sendPassword()]{@link sendPassword}
 * @param {String} email - User's email
 * @param {String} new - User's new input password
 */
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

/**
 * Controller function for resetPasswordGet. Checks if the token sent from [sendPassword()]{@link sendPassword} matches to stored 
 * token corresponding to the user in Mongo. If so, it shows the password reset page. Else, it shows the failure page.
 * @memberOf HomeController
 * @function
 * @alias resetPasswordGet
 * @param {String} token - token sent to the user's email from [sendPassword()]{@link sendPassword}
 * @param {String} email - User's email
 */
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

/**
 * Controller function for feedback. Saves submitted feedback into mongo.
 * @memberOf HomeController
 * @function
 * @alias feedback
 */
 HomeController.prototype._feedback = function (self, req, res) {
    var issue = new Feedback({issue:JSON.parse(req.body.data)[0]["Issue"], screenshot:JSON.parse(req.body.data)[1]}); //list of all feedback from mongo
    issue.save(function (err) {
        if (err) {
            console.log(err);
            return err;
        }
        else {
            console.log("Issue saved");
            res.end("Success");
        }
    });
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new HomeController();
