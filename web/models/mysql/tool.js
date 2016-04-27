var Bookshelf = require('../../config/bookshelf.js');
var Link = require('./relatedLinks.js');
var Domain = require('./domain.js');
var Downstream = require('./downstream.js');
var Upstream = require('./upstream.js');
var Extension = require('./extension.js');
var Agency = require('./agency.js');
var Funding = require('./funding.js');
var Format = require('./format.js');
var License = require('./license.js');
var Platform = require('./platform.js');
var Version = require('./version.js');
var Map = require('./map.js');
var Toolio = require('./toolio.js');
var Tag = require('./tag.js');
var User = require('./user.js');
var Resource = require('./resource.js');
var Language = require('./language.js');
var Institution = require('./institution.js');
var Center = require('./center.js');
var User_AZ = require('./user_az.js');

Bookshelf.plugin('registry');



// define the schema for our tool model
var toolSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_INFO',
    idAttribute: 'AZID',
    links: function() {
      return this.hasMany(Link, 'AZID');
    },
    domains: function() {
      return this.hasMany(Domain, 'AZID');
    },
    downstream: function() {
      return this.hasMany(Downstream, 'AZID');
    },
    upstream: function() {
      return this.hasMany(Upstream, 'AZID');
    },
    extension: function() {
      return this.hasOne(Extension, 'AZID');
    },
    agency: function() {
      return this.belongsToMany(Agency, 'FUNDING', 'AZID', 'AGENCY_ID')
    },
    funding: function() {
      return this.hasMany(Funding, 'AZID');
    },
    ioformat: function(){
      return this.belongsToMany(Format, 'TOOL_IO', 'AZID', 'IO_ID');
    },
    license: function() {
      return this.hasMany(License, 'AZID');
    },
    platform: function() {
      return this.belongsToMany(Platform, 'TOOL_PLATFORM', 'AZID', 'PLATFORM_ID');
    },
    version: function() {
      return this.hasMany(Version, 'AZID');
    },
    map: function() {
      return this.hasOne(Map, 'AZID');
    },
    io: function() {
      return this.hasMany(Toolio, 'AZID');
    },
    tags: function(){
      return this.belongsToMany(Tag, 'TOOL_TAG', 'AZID', 'TAG_ID');
    },
    users: function(){
      return this.belongsToMany(User, 'TOOL_USER', 'AZID', 'USER_ID');
    },
    resource_types: function(){
      return this.hasMany(Resource, 'AZID');
    },
    languages: function() {
      return this.belongsToMany(Language, 'TOOL_LANG', 'AZID', 'LANG_ID');
    },
    institutions: function() {
      return this.belongsToMany(Institution, 'TOOL_INSTITUTION', 'AZID', 'INST_NAME');
    },
    centers: function(){
      return this.hasMany(Center, 'AZID');
    },
    users_az: function() {
      return this.hasMany(User_AZ, 'AZID');
    },
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = Bookshelf.model('Tool', toolSchema);
