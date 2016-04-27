var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');
var Alias = require('./agency_alias.js');

// define the schema for our tool model
var agencySchema = Bookshelf.Model.extend({

    tableName: 'FUNDING_AGENCY',
    idAttribute: 'AGENCY_ID',
    tool: function() {
      return this.belongsToMany(Tool, 'FUNDING', 'AZID', 'AGENCY_ID')
    },
    aliases: function() {
      return this.hasMany(Alias);
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = agencySchema;
