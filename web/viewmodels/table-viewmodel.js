var Event = require('../utility/event.js');
var Table = require('../models/table.js');
var BD2K = require('../utility/bd2k.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  TableViewModel
//
function TableViewModel(request) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function() { self._onLoad(self); };

    var crud = new Event();

    this.request = request;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
TableViewModel.prototype._load = function (self, callback) {

    self.crud(callback);

    var show = new Table(self.request);
    show.load(function(rows) {
        self.table = rows;

        self.onLoad();
    });

};

//--- onLoad ------------------------------------------------------------------------------
TableViewModel.prototype._onLoad = function (self) {
   { self._crud.fire(self); }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = TableViewModel;