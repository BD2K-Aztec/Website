var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var domainSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_DOMAINS',
    tools: function() {
      return this.hasMany(Tool, 'TD_ID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = domainSchema;
