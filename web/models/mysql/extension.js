var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var extensionSchema = Bookshelf.Model.extend({

    tableName: 'EXTENSION',
    idAttribute: 'EXTENSION_ID',
    tools: function() {
      return this.belongsTo(Tool, 'AZID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = extensionSchema;
