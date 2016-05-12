var Bookshelf = require('../../config/bookshelf.js');
var Agency = require('./agency.js');

// define the schema for our alias model
var agency_aliasSchema = Bookshelf.Model.extend({

    tableName: 'AGENCY_ALIAS',
    idAttribute: 'ALIAS_ID',
    agency: function() {
      return this.belongsTo(Agency);
    }

});

// methods ======================


// create the model for alias and expose it to our app
module.exports = agency_aliasSchema;
