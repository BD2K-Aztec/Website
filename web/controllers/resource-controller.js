var BD2K = require('../utility/bd2k.js');
var SearchViewModel = require('../viewmodels/resource/search-viewmodel.js');
var Biojs = require('../models/resource/biojs.js');
var Elixir = require('../models/resource/elixir.js');
var Bioconductor = require('../models/resource/bioconductor.js');
var Biocatalogue = require('../models/resource/biocatalogue.js');
var Galaxy = require('../models/resource/galaxy.js');
var Resource = require('../models/resource.js');
var Search = require('../models/search.js');
var Tool = require('../models/tool.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ResourceController
//
function ResourceController() {

    var self = this;

    this.search = function(req, res) { self._search(self, req, res) };
    this.raw = function(req, res) { self._raw(self, req, res) };
    this.update = function(req, res) { self._update(self, req, res) };
    this.stat = function(req, res) { self._stat(self, req, res) };
    this.add = function(req, res) { self._add(self, req, res) };
    this.advanced = function(req, res) { self._advanced(self, req, res) };
}

//--- advanced -----------------------------------------------------------------------
ResourceController.prototype._advanced = function (self,req,res){
    var obj = {};
    obj.perPage = 10;

    var toolFilters = new Tool().filters();
    var placeHolderMap = {};

    for (var key in toolFilters) {
        var val = toolFilters[key];
        var label = val.label;
        placeHolderMap[label] = key;
    }

    obj.toolFilters = toolFilters;
    obj.placeHolderMap = placeHolderMap;

    res.render("resource/empty", obj);
};

//--- stat -----------------------------------------------------------------------
ResourceController.prototype._stat = function (self,req,res){
    var type = req.query.type.trim().toLowerCase();
    var resource = new Resource();
    resource.stat(type, function(s) {
        BD2K.json(res, s);
    });
};

//--- update -----------------------------------------------------------------------
ResourceController.prototype._update = function (self,req,res){
    var html = [
        '<html><body>Done</body></html>'
    ].join('\n');

    var resource = new Resource();
    resource.update(function(i){BD2K.html(res, html);});
};

//--- raw -----------------------------------------------------------------------
ResourceController.prototype._raw = function (self,req,res){
    var sourceStr = req.query.source.trim().toLowerCase();
    var source = {};
    source = sourceStr == "biojs" ? new Biojs() : source;
    source = sourceStr == "elixir" ? new Elixir() : source;
    source = sourceStr == "bioconductor" ? new Bioconductor() : source;
    source = sourceStr == "biocatalogue" ? new Biocatalogue() : source;
    source = sourceStr == "galaxy" ? new Galaxy() : source;

    source.load(function(i){res.render("resource/raw", i);});
};

//--- search -----------------------------------------------------------------------
ResourceController.prototype._search = function (self,req,res){

    var searchStr = req.query.input;

    var search = new Search();
    search.raw = searchStr;

    var onSave = function (s) {
        var json = JSON.parse(searchStr);
        var options = {};
        options.searchFilters = json.searchFilters;
        options.back = json.back || false;
        options.strict = json.strict;
        options.page = json.page || 1;
        options.perPage = json.perPage || 10;
        options.searchUuids = json.searchUuids || [];
        options.searchUuid = s.uuid;
        options.subsearch = BD2K.has(json.sub) ? json.sub : false;
        options.raw = searchStr;
        options.search = s;

        var searchViewModel = new SearchViewModel(options);
        searchViewModel.load(function(i){
            if(i.empty){
                res.render("resource/empty", i);
            }
            else
                res.render("resource/search", i);
        });
    };

    var uuid = search.save(onSave);


};

//--- add -----------------------------------------------------------------------
ResourceController.prototype._add = function (self,req,res){
    var json = req.query.input;

    var resource = new Resource();
    resource.add(json, function(i){res.render("tool/added", i);});

};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new ResourceController();