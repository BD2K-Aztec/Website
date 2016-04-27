var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var resourceSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_RESOURCE',
    tool: function() {
      return this.hasMany(Tool, 'TR_ID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = resourceSchema;
