var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');
Bookshelf.plugin('registry');

// define the schema for our tool model
var userSchema = Bookshelf.Model.extend({

    tableName: 'USER',
    idAttribute: 'USER_ID',
    tools: function() {
      return this.belongsToMany('Tool', 'TOOL_USER', 'USER_ID', 'AZID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = Bookshelf.model('User', userSchema);
