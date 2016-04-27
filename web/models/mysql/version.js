var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var versionSchema = Bookshelf.Model.extend({

    tableName: 'VERSION',
    idAttribute: 'VID',
    tool: function() {
      return this.hasOne(Tool, 'AZID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = versionSchema;
