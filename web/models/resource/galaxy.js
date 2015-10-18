var root = require.main.require;
var BD2K = root('./utility/bd2k.js');
var Event = root('./utility/event.js');
var fs = require('fs');
var path = require('path');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Galaxy
//
function Galaxy() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Galaxy.prototype._load = function (self, callback) {

    self.crud(callback);

    var data = require('../../scripts/resources/02_galaxy_repositories.json');
    var toolArr = [];

    for (var toolNum in data){
        var newTool = {};
        var curTool = data[toolNum];

        //var linkUrlArr = [];
        //var linkDescArr = [];
        //var tagArr = [];
        //
        ////tags
        //for(var tag in curTool.categories){
        //    tagArr.push(curTool.categories[tag]);
        //}
        //
        //newTool.name = curTool.name;
        //newTool.description = curTool.description;
        //if(!curTool.description){
        //    newTool.description = curTool.name;
        //}
        //
        //if(curTool.galaxy_url){
        //    linkUrlArr.push(curTool.galaxy_url);
        //    linkDescArr.push("Galaxy URL");
        //}
        //
        //if(curTool.repository_url) {
        //    newTool.sourceCodeURL = curTool.repository_url;
        //}
        //
        //newTool.linkUrls = linkUrlArr;
        //newTool.linkDescriptions = linkDescArr;
        //newTool.tags = tagArr;
        curTool.source = "Galaxy";
        curTool.dateCreated = new Date().toISOString();
        curTool.dateUpdated = new Date().toISOString();
        curTool.owners = ["adminOnly"];
        toolArr.push(curTool);
    }
    self.savedJSON = JSON.stringify(toolArr);
    fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/galaxy.json'), JSON.stringify(toolArr), function (err) {
        if (err) throw err;
    });

    self.onLoad();
};

//--- onLoad -----------------------------------------------------------------------------
Galaxy.prototype._onLoad = function(self){
    self._crud.fire(self);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Galaxy;