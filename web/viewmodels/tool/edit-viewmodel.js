var Event = require('../../utility/event.js');
var BD2K = require('../../utility/bd2k.js');
var config = require('../../config/app.json');
var solr = require('solr-client');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  EditViewModel
//
function EditViewModel(id) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function() { self._onLoad(self); };

    var crud = new Event();

    this.id = id;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
EditViewModel.prototype._load = function (self, callback) {

    self.crud(callback);

    var options = {};
    options.core = "BD2K";
    options.host = config.solrHost;
    options.port = config.solrPort;
    var client = solr.createClient(options);

    self.domains = [];
    self.types = [];
    self.platforms = [];
    self.fileTypes = [];

    var platformQuery = client.createQuery()
        .q("id:" + this.id)
        .edismax()
        .start(0)
        .rows(10);
    client.search(platformQuery,function(err,obj){
        if(err){
            console.log(err);
        }else{
            console.log(obj);

            self.preset = obj.response.docs[0];
            self.onLoad();
        }
    });
};

//--- onLoad ------------------------------------------------------------------------------
EditViewModel.prototype._onLoad = function (self) {
    //{ if (BD2K.has([self.types, self.domains, self.platforms, self.fileTypes])) {
        self._crud.fire(self);
    //} }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = EditViewModel;