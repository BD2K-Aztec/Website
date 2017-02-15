/**
*	Mongo Feedback Model
*	@param {String} issue - description of the issue
*/

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    issue        : String,
    screenshot   : String

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Feedback', userSchema);