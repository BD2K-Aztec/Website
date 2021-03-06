// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/mongo/user.js');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'admin@bd2kcc.org',
        pass: '2eyxv2ewbr'
    }
});

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user && user.authenticated) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    }
                    else if (password.length < 6 || password.length > 18){
                        return done(null, false, req.flash('signupMessage', 'Password must be between 6 and 18 characters.'));
                    }
                    else {

                        // if there is no user with that email or we can replace unauthenticated user
                        // create the user
                        var newUser;
                        if(user)
                            newUser = user;
                        else
                            newUser = new User();

                        // set the user's local credentials
                        newUser.email    = email;
                        newUser.password = newUser.generateHash(password);
                        newUser.isAdmin = false;
                        newUser.authenticated = false;

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });

            });

        }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                if(!user.authenticated){
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

                    return done(null, false, req.flash('loginMessage', 'Please authenticate your account. An email has been sent to you.')); // create the loginMessage and save it to session as flashdata
                }

                // all is well, return successful user
                return done(null, user);
            });

        }));

    passport.use('local-password', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('passwordMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('passwordMessage', 'Oops! Wrong current password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));
};