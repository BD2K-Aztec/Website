var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var platformSchema = Bookshelf.Model.extend({

    tableName: 'PLATFORM',
    idAttribute: 'PLATFORM_ID',
    tool: function() {
      return this.belongsToMany(Tool, 'TOOL_PLATFORM', 'AZID', 'PLATFORM_ID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = platformSchema;
