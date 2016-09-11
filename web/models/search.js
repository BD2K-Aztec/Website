/**
 * @fileoverview Search Model
 */

var BD2K = require('../utility/bd2k.js');
var mongo = BD2K.mongo;
var solr = BD2K.solr;
var uuid = require('uuid');
var Resources = require('./resources.js');

/**
 * @class Search
 * @constructor
 * @classdesc Search _________
 */
function Search() {
    var self = this;
    this.save = function(callback) { return self._save(self, callback); };
    this.load = function(callback) { return self._load(self, callback); };
    this.suggest = function(callback) { return self._suggest(self, callback); };
    this.toHash = function(i) {
        if(i > -1)
            console.log("i")
        return JSON.parse(self.raw);
    };
    this.results = function(callback) { return self._results(self, callback); };
}

//--- load ------------------------------------------------------------------------------
Search.prototype._load = function (self, callback) {
    var search = {};
    search.uuid = self.uuid;
    mongo.search("resource_search", search, function(s){ callback(self._fromMongo(self, s)); });
};

//--- fromMongo ------------------------------------------------------------------------------
Search.prototype._fromMongo = function (self, search) {
    self.raw = search[0].raw;
    self.query = search[0].query;
    return self;
};

//--- results ------------------------------------------------------------------------------
Search.prototype._results = function (self, callback) {
    var query = self.query;
    solr.search(query, function(r){
        self.result = Resources.fromSolr(r);
        callback(self);
    });
};

//--- save ------------------------------------------------------------------------------
Search.prototype._save = function (self, callback) {

    callback = callback || function() {};

    if (BD2K.has(self.uuid)) {
        return self._update(self, callback);
    }
    else {
        return self._insert(self, callback);
    }
};

//--- update ------------------------------------------------------------------------------
Search.prototype._update = function (self, callback) {
    var search = {};
    search.uuid = self.uuid;

    var doc = {};
    doc.uuid = self.uuid;
    doc.query = self.query;
    doc.raw = self.raw;
    mongo.update("resource_search", search, doc, function(r) { callback(self); });
    return search.uuid;
};

//--- insert ------------------------------------------------------------------------------
Search.prototype._insert = function (self, callback) {

    self.uuid = uuid.v1();

    var search = {};
    search.uuid = self.uuid;
    search.raw = self.raw;
    mongo.insert("resource_search", search, function(r) { callback(self); });
    return search.uuid;
};

/**
 * Gets solr suggestions for type ahead (autocomplete)
 * @function
 * @memberof Search
 * @alias suggest
 */
Search.prototype._suggest = function(self, callback) {
    query = self.query;
    var fields = {}
    fields.name = query["searchFilters"]["resource"];
    fields.searchType = query.searchFilters.searchType;
    solr.search_suggest(fields, function(r){
        var results = Resources.fromSolrSuggest(r, fields);
        callback(results);
    });
}



//---------------------------------------------------------------------------------

module.exports = Search;