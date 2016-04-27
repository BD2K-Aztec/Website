var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var formatSchema = Bookshelf.Model.extend({

    tableName: 'IO_FORMATS',
    idAttribute: 'IO_ID',
    tool: function() {
      return this.belongsToMany(Tool, 'TOOL_IO', 'AZID', 'IO_ID')
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = formatSchema;
