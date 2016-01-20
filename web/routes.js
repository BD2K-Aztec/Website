// app/routes.js
var HomeController = require('./controllers/home-controller.js');
var ResourceController = require('./controllers/resource-controller.js');
var ToolController = require('./controllers/tool-controller.js');

module.exports = function(app, passport) {

    app.get('/', HomeController.index);
    app.get('/:id', ToolController.idRoute);

    app.get('/home/index', HomeController.index);
    app.get('/home/overview', HomeController.overview);
    app.get('/home/metadata', HomeController.metadata);
    app.get('/home/technologies', HomeController.technologies);
    app.get('/home/sources', HomeController.sources);
    app.get('/home/authenticate', HomeController.authenticate);
    app.get('/home/success', HomeController.success);
    app.get('/home/failure', HomeController.failure);

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


    app.get('/home/password', HomeController.password);
    app.post('/home/password', passport.authenticate('local-password', {
        failureRedirect : '/home/password', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }), HomeController.postPassword);
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/home/login', getLoginInformation, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('home/login', {
            loggedIn: req.loggedIn,
            user: req.loggedIn,
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/home/login', passport.authenticate('local-login', {
        successRedirect : '/home/profile', // redirect to the secure profile section
        failureRedirect : '/home/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/home/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('home/signup', {
            loggedIn : req.loggedIn,
            user : req.user, // get the user out of session and pass to template
            message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/home/signup', passport.authenticate('local-signup', {
        failureRedirect : '/home/signup', // redirect back to the signup page if there is an error
    }), HomeController.signup);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/home/profile', isLoggedIn, getLoginInformation, HomeController.profile);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/home/logout', function(req, res) {
        req.logout();
        res.redirect('/home/login');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.authenticated)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/home/login');
}

// route middleware to make sure a user is logged in
function getLoginInformation(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.authenticated){
        req.loggedIn = true;
    }
    else{
        req.loggedIn = false;
    }
    return next();
}