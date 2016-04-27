// load the things we need
var mongoose = require('mongoose');

// define the schema for our funding model
var authorSchema = mongoose.Schema({

      first_name       : String,
      last_name        : String,
      email            : String

});


// create the model for funding and expose it to our app
module.exports = mongoose.model('Author', authorSchema);
