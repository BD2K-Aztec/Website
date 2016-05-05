var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var userSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_USER_AZ',
    tool: function() {
      return this.belongsTo('Tool', 'AZID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = userSchema;
