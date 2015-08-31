var ToolViewModel = require('../viewmodels/tool-viewmodel.js');
var ToolInfoViewModel = require('../viewmodels/tool-info-viewmodel.js');
var NewToolViewModel = require('../viewmodels/new-tool-viewmodel.js');
var TableViewModel = require('../viewmodels/table-viewmodel.js');
var SearchFiltersViewModel = require('../viewmodels/resource/search-viewmodel.js');
var Biojs = require('../models/resource/biojs.js');
var BD2K = require('../utility/bd2k.js');
var Elixir = require('../models/resource/elixir.js');
var Bioconductor = require('../models/resource/bioconductor.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  IndexController
//
function IndexController() {
    var self = this;

    this.index = function(req, res) { self._index(self, req, res); };
    this.newTool = function(req, res) { self._newTool(self, req, res) };
    this.toolInput = function(req, res) { self._toolInput(self, req, res) };
    this.showTable = function(req, res) { self._showTable(self, req, res) };
    this.toolInfo = function(req, res) { self._toolInfo(self, req, res) };
    this.search = function(req, res) { self._search(self, req, res) };
    this.searchFilters = function(req, res) { self._searchFilters(self, req, res) };
    this.results = function(req, res) { self._results(self, req, res) };
    this.biojs = function(req, res) { self._biojs(self, req, res) };
    this.elixir = function(req, res) { self._elixir(self, req, res) };
    this.bioconductor = function(req, res) { self._bioconductor(self, req, res) };
}

//--- index -----------------------------------------------------------------------
IndexController.prototype._index = function (self, req, res) {
    res.render("index");
};

//--- newTool ------------------------------------------------------------------
IndexController.prototype._newTool = function (self, req, res){
    var tool = new NewToolViewModel(req.query.input);
    tool.load(function(i){ res.render("new-tool", i); });
};

//--- toolInput -----------------------------------------------------------------------
IndexController.prototype._toolInput = function (self, req, res){
    var input = new ToolViewModel(JSON.parse(req.query.input));
    input.load(function(i){ res.render("input", i); });
    //self.toolInfo({query:{ id: '12' }}, res);
};

//--- showTools -----------------------------------------------------------------------
IndexController.prototype._showTable = function (self, req, res){
    var show = new TableViewModel(req.query.table);
    show.load(function(i){ res.render("show-table", i); });
};

//--- toolInfo -----------------------------------------------------------------------
IndexController.prototype._toolInfo = function (self,req,res){
    var info = new ToolInfoViewModel(req.query.id);
    info.load(function(i){
        res.render("tool-info", i);
    });
};

//--- search -----------------------------------------------------------------------
IndexController.prototype._search = function (self,req,res){
    res.render("search-resource");
};

//--- searchFilters -----------------------------------------------------------------------
IndexController.prototype._searchFilters = function (self,req,res){
    var filter = new SearchFiltersViewModel(req.body.f, req.body.q);
    filter.load(function(i){ res.json(i); });
};

//--- results -----------------------------------------------------------------------
IndexController.prototype._results = function (self,req,res){
    var json = JSON.parse(req.query.input);
    var filter = new SearchFiltersViewModel(json.f, json.q);
    filter.load(function(i){
        res.render("search-results", i); });

};

//--- biojs -----------------------------------------------------------------------
IndexController.prototype._biojs = function (self,req,res){
    var bio = new Biojs();
    bio.load(function(i){res.render("biojs", i);});
};

//--- elixir -----------------------------------------------------------------------
IndexController.prototype._elixir = function (self,req,res){
    var elixir = new Elixir();
    elixir.load(function(i){res.render("elixir", i);});
};

//--- bioconductor -----------------------------------------------------------------------
IndexController.prototype._bioconductor = function (self,req,res){
    var bioconductor = new Bioconductor();
    bioconductor.load(function(i){res.render("bioconductor", i);});
};
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new IndexController();