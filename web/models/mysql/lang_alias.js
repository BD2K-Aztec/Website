var Bookshelf = require('../../config/bookshelf.js');
var Language = require('./language.js');

// define the schema for our alias model
var lang_aliasSchema = Bookshelf.Model.extend({

    tableName: 'LANGUAGE_ALIAS',
    idAttribute: 'ALIAS_ID',
    institution: function() {
      return this.belongsTo(Language);
    }

});

// methods ======================


// create the model for alias and expose it to our app
module.exports = lang_aliasSchema;
