// load the things we need
var mongoose = require('mongoose');

// define the schema for our publication model
var publicationSchema = mongoose.Schema({

      pub_doi           : String,
      primary           : {type: Boolean, default: false}

});


// create the model for publications and expose it to our app
module.exports = mongoose.model('Publication', publicationSchema);
