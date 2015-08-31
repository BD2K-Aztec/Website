var Event = require('../../utility/event.js');
var ShowAll = require('../../models/table.js');
var BD2K = require('../../utility/bd2k.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  CreateViewModel
//
function CreateViewModel(request) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function() { self._onLoad(self); };

    var crud = new Event();

    this.request = request;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
CreateViewModel.prototype._load = function (self, callback) {

    self.crud(callback);

    //var showDomains = new ShowAll("BiologicalDomains");
    //showDomains.load(function(rows) {
    //    self.domains = [];
    //
    //    for (var i = 0; i < rows.length; i++) {
    //        var domain = {};
    //        domain.DomainID = rows[i].DomainID;
    //        domain.Type = rows[i].Type;
    //        self.domains.push(domain);
    //    }
    //
    //    self.onLoad();
    //});
    //
    //var showTypes = new ShowAll("Types");
    //showTypes.load(function(rows) {
    //    self.types = [];
    //
    //    for (var i = 0; i < rows.length; i++) {
    //        var type = {};
    //        type.TypeID = rows[i].TypeID;
    //        type.Type = rows[i].Type;
    //        self.types.push(type);
    //    }
    //
    //    self.onLoad();
    //});
    //
    //var showPlatforms = new ShowAll("Platforms");
    //showPlatforms.load(function(rows) {
    //    self.platforms = [];
    //
    //    for (var i = 0; i < rows.length; i++) {
    //        var platform = {};
    //        platform.PlatformID = rows[i].PlatformID;
    //        platform.Platform = rows[i].Platform;
    //        self.platforms.push(platform);
    //    }
    //
    //    self.onLoad();
    //});
    //
    //var showFileTypes = new ShowAll("FileTypes");
    //showFileTypes.load(function(rows) {
    //    self.fileTypes = [];
    //
    //    for (var i = 0; i < rows.length; i++) {
    //        var fileType = {};
    //        fileType.FileID = rows[i].FileID;
    //        fileType.Type = rows[i].Type;
    //        fileType.Description = rows[i].Description;
    //        self.fileTypes.push(fileType);
    //    }
    //
    //    self.onLoad();
    //});
    self.domains = [];
    self.types = [];
    self.platforms = [];
    self.fileTypes = [];
    self.preset = {};
    self.onLoad();
};

//--- onLoad ------------------------------------------------------------------------------
CreateViewModel.prototype._onLoad = function (self) {
    //{ if (BD2K.has([self.types, self.domains, self.platforms, self.fileTypes])) {
        self._crud.fire(self);
    //} }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = CreateViewModel;