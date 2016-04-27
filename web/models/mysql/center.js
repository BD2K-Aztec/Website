var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var bd2kSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_BD2K',
    tools: function() {
      return this.hasMany(Tool, 'TB_ID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = bd2kSchema;
