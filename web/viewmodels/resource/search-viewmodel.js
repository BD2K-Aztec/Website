var Event = require('../../utility/event.js');
var BD2K = require('../../utility/bd2k.js');
var Search = require('../../models/search.js');
var Resources = require('../../models/resources.js');
var Tool = require('../../models/tool.js');


//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  SearchViewModel
//
function SearchViewModel(options) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function(search) { self._onLoad(self, search); };

    var crud = new Event();

    var toolFilters = new Tool().filters();
    var placeHolderMap = {};

    for (var key in toolFilters) {
        var val = toolFilters[key];
        var label = val.label;
        placeHolderMap[label] = key;
    }

    this.searchFilters = options.searchFilters;
    this.strict = options.strict || {};
    this.page = options.page;
    this.back = options.back;
    this.perPage = options.perPage;
    this.searched = options.searchFilters[Object.keys(options.searchFilters)[0]];
    this.searchUuids = options.searchUuids;
    this.searchUuid = options.searchUuid;
    this.subsearch = options.subsearch;
    this.prevSearches = [];
    this.raw = options.raw;
    this.search = options.search;
    this.toolFilters = toolFilters;
    this.placeHolderMap = placeHolderMap;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
SearchViewModel.prototype._load = function (self, callback) {

    var cont = {};

    cont.run = function() {

        self.crud(callback);

        var filters = self.searchFilters;

        cont.filters = filters;

        if(Object.keys(filters).length === 1 && typeof(filters["resource"]) !== "undefined" && filters["resource"].trim() === ""){
            self.empty = true;
            self._crud.fire(self);
            return;
        }
        else if ("resource" in filters) {
            var val = filters["resource"];
            filters["name"] = val;
            filters["description"] = val;
            filters["publicationDOI"] = val;
            filters["authors"] = val;
            filters["tags"] = val;
        }

        if ("tool" in filters) {
            var val = filters["tool"];
            filters["name"] = val;
            filters["description"] = val;
            filters["publicationDOI"] = val;
            filters["authors"] = val;
            filters["tags"] = val;
        }

        for(var key in filters["searchFilters"]){
            if(filters[key].trim() === "")
                delete filters[key];
        }

        self.hasEdam = false;
        cont.continue();
    };

    cont.continue = function () {
        var filters = cont.filters;
        var query = {};
        for(var key in filters){
            var val = filters[key];
            if(!(key in query)) { query[key] = []; }
            query[key].push(val);
        }

        var search = new Search();
        search.uuid = self.searchUuid;
        search.query = query;
        search.raw = self.raw;
        search.save();

        var searchHash = {};
        self._searches = [];

        if(!self.subsearch && !self.back) {
            self.searchUuids = [];
        }
        else{
            for (var i=0; i<self.searchUuids.length; i++) {
                var searchUuid = self.searchUuids[i];
                searchHash[searchUuid] = false;
            }
        }

        if(!self.back)
            searchHash[self.searchUuid] = false; //current search!!!

        self._searchHash = searchHash;
        self.empty = false;
        if (self.searchUuids.length == 0) {
            search.results(function(r){
                self._searches.push(r);
                self.onLoad(r)
            });
            return;
        }

        var searches = [];
        var onSearchLoad = function(s) {
            searches.push(s);
            self.prevSearches.push(s);
            if (searches.length != self.searchUuids.length) { return; }

            if (!self.back) {
                searches.push(search);
            }

            for (var i=0; i<searches.length; i++) {
                var curSearch = searches[i];
                curSearch.results(function(r){
                    self._searches.push(r);
                    self.onLoad(r);
                });
            }
        };

        for (var i=0; i<self.searchUuids.length; i++){
            var searchUuid = self.searchUuids[i];
            var curSearch = new Search();
            curSearch.uuid = searchUuid;
            curSearch.index = i;
            curSearch.load(onSearchLoad);
        }
    };

    cont.run();
};

//--- filterStrict ------------------------------------------------------------------------------
SearchViewModel.prototype._filterStrict = function (self) {
    var strictObj = self.resources.clone();
    var strict = self.strict;
    var docs = strictObj.group;
    for (var i=docs.length-1; i>=0; i--){
        var doc = docs[i];
        for(var key in strict) {
            var propVal = doc[key];
            var filter = strict[key];
            if (BD2K.isArray(propVal)) {
                var has = false;
                for (var j=0; j<propVal.length; j++){
                    for(var exactVal in filter) {
                        if (propVal[j] === exactVal) { has = true; break; }
                    }
                    if (has) { break; }
                }
                if (!has) { docs.splice(i, 1); break; }
            }
            else{
                var has = false;
                for(var exactVal in filter) {
                    if (propVal === exactVal) { has = true; break; }
                }
                if (!has) { docs.splice(i, 1); break; }
            }
        }
    }
    self.resources = strictObj;
};

//--- onLoad ------------------------------------------------------------------------------
SearchViewModel.prototype._addMainType = function (self) {
    var docs = self.resources.group;
    self.metrics = {};

    for (var i = 0; i < docs.length; i++) {
        if (!docs[i].types) {
            docs[i].type = "Others";
        }
        else if (docs[i].types[0].match(/widget/i)) {
            docs[i].type = "Widget";
        }
        else if (docs[i].types[0].match(/database/i)) {
            docs[i].type = "Database";
        }
        else if (docs[i].types[0].match(/tool/i)) {
            docs[i].type = "Tool";
        }
        else {
            docs[i].type = "Others";
        }
    }
};

//--- onLoad ------------------------------------------------------------------------------
SearchViewModel.prototype._addMetricHashes = function (self) {
    var docs = self.resources.group;
    self.metrics = {};
    var strict = self.strict;

    for (var i=0; i<docs.length; i++){
        var doc = docs[i];

        for(var prop in doc) {
            var vals = BD2K.array(doc[prop]);
            if (vals.length == 1 && !BD2K.has(vals[0])) { continue; }
            if (!BD2K.has(self.metrics[prop])) { self.metrics[prop] = {}; }
            for(var j=0; j<vals.length; j++) {
                var val = vals[j];
                if (!BD2K.has(val)) { continue; }
                if (!BD2K.has(self.metrics[prop][val])) { self.metrics[prop][val] = 0; }
                self.metrics[prop][val]++;
            }
        }
    }

    for (var prop in self.metrics) {
        var obj = self.metrics[prop];
        var tuples = [];

        for (var key in obj)
            tuples.push([key, obj[key]]);

        tuples.sort(function (a, b) {
            a = a[1];
            b = b[1];

            return a > b ? -1 : (a < b ? 1 : 0);
        });

        self.metrics[prop] = tuples;
    }
    var filterList = ["type", "domains", "platforms", "language", "source"];
    var filters = [];
    for (var i=0; i<filterList.length; i++) {
        var prop = filterList[i];
        var arr = self.metrics[prop];
        var arrObjList = [];
        if (arr){
            for (var j = 0; j < arr.length; j++) {
                var arrObj = {};
                var subLabelArr = arr[j];
                arrObj.labelArr = subLabelArr;
                arrObj.checked = BD2K.has(strict[prop]) && BD2K.has(strict[prop][subLabelArr[0]]);
                arrObjList.push(arrObj);
            }
        }
        var filterObj = {};
        filterObj.raw = prop;
        filterObj.label = prop.substr(0,1).toUpperCase() + prop.substr(1);
        filterObj.list = arrObjList;
        filters.push(filterObj);
    }
    self.resultFilters = filters;
};

//--- onLoad ------------------------------------------------------------------------------
SearchViewModel.prototype._onLoad = function (self, search) {

    self._searchHash[search.uuid] = true;

    var exit = false;
    for (var key in self._searchHash) {
        var val = self._searchHash[key];
        if (val == false) {
            exit = true;
            break;
        }
    }
    if (exit) { return; }

    var resources = new Resources();

    var resourcesArr = [];
    for (var i=0; i<self._searches.length; i++) {
        resourcesArr.push(self._searches[i].result);
    }
    resources.combine(resourcesArr);

    self.resources = resources;
    self._addMainType(self);
    self._filterStrict(self);
    self._addMetricHashes(self);

    self.prevSearches.sort(function (a, b) {
        return a.index < b.index ? -1 : (a.index > b.index ? 1 : 0);
    });

    if(!self.back)
        self.searchUuids.push(self.searchUuid);

    self._crud.fire(self);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = SearchViewModel;