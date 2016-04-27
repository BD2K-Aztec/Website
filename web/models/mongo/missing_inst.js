// load the things we need
var mongoose = require('mongoose');

// define the schema for our missing inst model
var missing_instSchema = mongoose.Schema({

      new_institution        : String

});


// create the model for missing inst and expose it to our app
module.exports = mongoose.model('Missing_Inst', missing_instSchema);
