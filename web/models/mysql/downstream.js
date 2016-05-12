var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var downstreamSchema = Bookshelf.Model.extend({

    tableName: 'DOWNSTREAM_TOOLS',
    tools: function() {
      return this.hasMany(Tool, 'AZID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = downstreamSchema;
