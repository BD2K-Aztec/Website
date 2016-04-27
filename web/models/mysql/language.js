var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');
var Alias = require('./lang_alias.js');

// define the schema for our tool model
var languageSchema = Bookshelf.Model.extend({

    tableName: 'LANGUAGE',
    idAttribute: 'LANG_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_LANG', 'AZID', 'LANG_ID');
    },
    aliases: function() {
      return this.hasMany(Alias);
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = languageSchema;
