// load the things we need
var mongoose = require('mongoose');

// define the schema for our maintainer model
var maintainerSchema = mongoose.Schema({

      first_name          : String,
      last_name           : String,
      email               : String

});


// create the model for maintainer and expose it to our app
module.exports = mongoose.model('Maintainer', maintainerSchema);
