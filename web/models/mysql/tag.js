var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var tagSchema = Bookshelf.Model.extend({

    tableName: 'TAG',
    idAttribute: 'TAG_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_TAG', 'AZID', 'TAG_ID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = tagSchema;
