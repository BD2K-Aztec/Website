var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var relatedLinksSchema = Bookshelf.Model.extend({

    tableName: 'RELATED_LINKS',
    idAttribute: 'LINK_ID',
    tool: function() {
      return this.belongsTo(Tool, 'AZID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = relatedLinksSchema;
