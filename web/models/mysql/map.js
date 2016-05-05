var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var mapSchema = Bookshelf.Model.extend({

    tableName: 'RESOURCE_MAP',
    idAttribute: 'AZID',
    tool: function() {
      return this.hasOne(Tool, 'AZID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = mapSchema;
