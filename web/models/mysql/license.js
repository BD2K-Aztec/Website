var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var licenseSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_LICENSE',
    tool: function() {
      return this.hasMany(Tool, 'TL_ID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = licenseSchema;
