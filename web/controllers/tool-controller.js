var ToolInfoViewModel = require('../viewmodels/tool-info-viewmodel.js');
var CreateViewModel = require('../viewmodels/tool/create-viewmodel.js');
var EditViewModel = require('../viewmodels/tool/edit-viewmodel.js');
var BD2K = require('../utility/bd2k.js');
var Tool = require('../models/tool.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ToolController
//
function ToolController() {
    var self = this;

    this.show = function(req, res) { self._show(self, req, res) };
    this.create = function(req, res) { self._create(self, req, res) };
    this.filters = function(req, res) { self._filters(self, req, res); };
    this.edit = function(req, res) { self._edit(self, req, res); };
}

//--- filters ------------------------------------------------------------------
ToolController.prototype._filters = function (self, req, res){
    var filters = new Tool().filters();
    BD2K.json(res, filters);
};

//--- create ------------------------------------------------------------------
ToolController.prototype._create = function (self, req, res){
    var tool = new CreateViewModel(req.query.input);
    tool.load(function(i){ res.render("tool/create", i); });
};

//--- edit ------------------------------------------------------------------
ToolController.prototype._edit = function (self, req, res){
    var tool = new EditViewModel(req.query.id);
    tool.load(function(i){ res.render("tool/create", i); });
};

//--- show -----------------------------------------------------------------------
ToolController.prototype._show = function (self,req,res){
    var info = new ToolInfoViewModel(req.query.id);
    info.load(function(i){
        res.render("tool/show", i);
    });
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new ToolController();