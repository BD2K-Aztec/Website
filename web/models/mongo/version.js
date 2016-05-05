// load the things we need
var mongoose = require('mongoose');

// define the schema for our version model
var versionSchema = mongoose.Schema({

      version               : String,
      version_date          : Date,
      version_description   : String,
      latest                : {type: Boolean, default: false}

});


// create the model for versions and expose it to our app
module.exports = mongoose.model('Version', versionSchema);
