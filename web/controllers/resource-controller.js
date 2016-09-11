/**
 * @fileoverview Resource Controller: solr management, statistics management, and searching.
 */

var BD2K = require('../utility/bd2k.js');
var SearchViewModel = require('../viewmodels/resource/search-viewmodel.js');
var Resource = require('../models/resource.js');
var Search = require('../models/search.js');
var Tool = require('../models/tool.js');
var ToolInfoViewModel = require('../viewmodels/tool-info-viewmodel.js');

/**
 * @class ResourceController
 * @constructor
 * @classdesc Controller for solr management, statistics management, and searching.
 */
function ResourceController() {

    var self = this;

    this.search = function(req, res) { self._search(self, req, res) };
    this.autocomplete = function(req,res) { self._autocomplete(self, req, res)};
    this.update = function(req, res) { self._update(self, req, res) };
    this.stat = function(req, res) { self._stat(self, req, res) };
    this.add = function(req, res) { self._add(self, req, res) };
    this.advanced = function(req, res) { self._advanced(self, req, res) };
    this.getNameFromID = function(req, res){ self._getNameFromID(self, req, res)};
    this.idRoute = function(req, res) { self._idRoute(self, req, res); };
}

/**
 * Controller function for advanced search page. Page shown when advanced search is clicked in navbar.
 * @function
 * @memberof ResourceController
 * @alias advanced
 */
ResourceController.prototype._advanced = function (self,req,res){
    var obj = {};
    obj.perPage = 10;

    var toolFilters = new Tool().filters(); //list of filters that the user can use to search
    var placeHolderMap = {}; //holds mapping from solr key to text shown on HTML page

    for (var key in toolFilters) {
        var val = toolFilters[key];
        var label = val.label;
        placeHolderMap[label] = key;
    }

    obj.toolFilters = toolFilters;
    obj.placeHolderMap = placeHolderMap;

    res.render("resource/empty", obj);
};

/**
 * Controller function for retrieving stat files (json files) from resource_stats collection in mongo.
 * @function
 * @memberof ResourceController
 * @alias stat
 * @param {String} type - name of file to get
 */
ResourceController.prototype._stat = function (self,req,res){
    var type = req.query.type.trim().toLowerCase();
    var resource = new Resource();
    resource.stat(type, function(s) {
        BD2K.json(res, s);
    });
};

/**
 * Controller function for updating statistics in mongo. Calls [update()]{@link Resource.update} in [Resource]{@link Resource}.
 * @function
 * @memberof ResourceController
 * @alias update
 */
ResourceController.prototype._update = function (self,req,res){
    var html = [
        '<html><body>Done</body></html>'
    ].join('\n');

    var resource = new Resource();
    resource.update(function(i){BD2K.html(res, html);});
};

//--- search -----------------------------------------------------------------------
ResourceController.prototype._search = function (self,req,res){

    var searchStr = req.query.input;

    var search = new Search();
    search.raw = searchStr;

    var onSave = function (s) {
        var json = JSON.parse(searchStr);
        console.log(json);
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

/**
 * Returns solr suggestions for type ahead capability. Calls [suggest()]{@link Search.suggest} from [Search]{@link Search} class.
 * @function
 * @memberof ResourceController
 * @alias autocomplete
 */
ResourceController.prototype._autocomplete = function (self,req,res){
    var search = new Search();
    search.raw = req.query;

    var query = req.query;
    search.query = query;

    search.suggest(function(i){
        res.send(JSON.stringify(i));
    });

};

/**
 * Searches solr for tool name based on the ID. 
 * @function
 * @memberof ResourceController
 * @alias getNameFromID
 */
ResourceController.prototype._getNameFromID = function(self, req, res)
{
    var json = req.query
    BD2K.solr.search(json, function (obj) {
        if(obj.response.docs.length > 0) {
            var results = obj.response.docs[0]["name"];
            res.send(results);
        }
    });
}

//--- idRoute -----------------------------------------------------------------------
ResourceController.prototype._idRoute = function (self,req,res){
    if(req.params.id){
        console.log(req.params.id);

        if(req.params.id.substring(0,2) != 'AZ') {
            return res.redirect('/home/failure');
            return false;
        }

        if(req.params.id.substring(2).length != 7){
            var newId = ("0000000" + req.params.id.substring(2)).slice(-7);
            return res.redirect('/AZ' + newId)
        }

        var id = parseInt(req.params.id.substring(2), 10);
        var info = new ToolInfoViewModel(id);

        info.load(function(i){

            i.resource.editable = false;
            if(req.isAuthenticated() && (i.resource.owners || req.user.isAdmin)){
                if(req.user.isAdmin || i.resource.owners.indexOf(req.user.email) > -1){
                    i.resource.editable = true;
                }
            }

            res.render("tool/show", BD2K.extend(i, {
                loggedIn: req.loggedIn,
                user: req.user
            }));
        });
    }
    else{
        return res.redirect('/home/failure');
    }
};
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new ResourceController();
