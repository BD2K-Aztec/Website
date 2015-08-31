var Event = require('../utility/event.js');
var Tool = require('../models/tool.js');
var BD2K = require('../utility/bd2k.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ToolxViewModel
//
function ToolViewModel(request) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function() { self._onLoad(self); };

    var crud = new Event();

    this.request = request;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
ToolViewModel.prototype._load = function (self, callback) {

    self.crud(callback);

    var tool = new Tool(self.request, "insert"); //parsed options
    tool.save(function(retObj) {
        self.id = retObj.id;
        self.res = retObj.res;
        self.strRes = retObj.strRes;
        self.onLoad();
    });

};

//--- onLoad ------------------------------------------------------------------------------
ToolViewModel.prototype._onLoad = function (self) {
   { self._crud.fire(self); }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = ToolViewModel;