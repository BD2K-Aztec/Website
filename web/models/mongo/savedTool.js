// load the things we need
var mongoose = require('mongoose');

// define the schema for our toolMisc model
var toolSchema = mongoose.Schema({
    user             : String,
    date             : { type: Date, default: Date.now }
}, {strict: false});


// create the model for tools and expose it to our app
module.exports = mongoose.model('SavedTool', toolSchema);
