var Bookshelf = require('../../config/bookshelf.js');
var Institution = require('./institution.js');

// define the schema for our alias model
var inst_aliasSchema = Bookshelf.Model.extend({

    tableName: 'INST_ALIAS',
    idAttribute: 'ALIAS_ID',
    institution: function() {
      return this.belongsTo(Institution);
    }

});

// methods ======================


// create the model for alias and expose it to our app
module.exports = inst_aliasSchema;
