var BD2K = require('../utility/bd2k.js');
var Event = require('../utility/event.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Table
//
function Table(name) {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this.table = name;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Table.prototype._load = function (self, callback) {

    self.crud(callback);

    var sql = "SELECT * FROM " + self.table;

    BD2K.mysql(sql, self.onLoad);

};

//--- onLoad -----------------------------------------------------------------------------
Table.prototype._onLoad = function(self, rows){
    self._crud.fire(rows);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Table;
