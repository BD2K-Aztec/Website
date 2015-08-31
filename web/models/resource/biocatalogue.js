var root = require.main.require;
//var BD2K = root('../../utility/bd2k.js');
//var Event = root('../../utility/event.js');
var BD2K = root('./utility/bd2k.js');
var Event = root('./utility/event.js');
var fs = require('fs');
var path = require('path');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Biocatalogue
//
function Biocatalogue() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Biocatalogue.prototype._load = function (self, callback) {

    self.crud(callback);

    var data = require('../../scripts/resources/01_biocatalogue_services.json');
    var toolArr = [];

    for (var toolNum in data){
        var newTool = {};
        var curTool = data[toolNum];

        //var linkUrlArr = [];
        //var linkDescArr = [];
        //var authorArr = [];
        //var typeArr = [];
        //var tagArr = [];
        //
        ////tags
        //for(var tag in curTool.categories){
        //    tagArr.push(curTool.categories[tag].name);
        //}
        //
        //for(var doc in curTool.documentation_urls){
        //    linkUrlArr.push(curTool.documentation_urls[doc]);
        //    linkDescArr.push("Documentation");
        //}
        //
        //for(var doc in curTool.endpoints){
        //    linkUrlArr.push(curTool.endpoints[doc].endpoint);
        //    linkDescArr.push("Service URL");
        //}
        //
        //newTool.name = curTool.name;
        //newTool.description = curTool.description;
        //if(!curTool.description){
        //    newTool.description = curTool.name;
        //}
        //for(var provider in curTool.providers){
        //    authorArr.push(curTool.providers[provider].service_provider.name);
        //}
        //
        //var yesPub = false;
        //var inputPub = "";
        //for(var pub in curTool.publications){
        //    yesPub = true;
        //    inputPub += curTool.publications[pub] + "; ";
        //}
        //if(yesPub)
        //    newTool.pubmedID = inputPub;
        //
        //for(var tag in curTool.tags){
        //    tagArr.push(curTool.tags[tag].name);
        //}
        //
        //for(var type in curTool.toolType){
        //    typeArr.push(curTool.toolType[type]);
        //}
        //
        //newTool.id = Math.random().toString();
        //newTool.authors = authorArr;
        //newTool.linkUrls = linkUrlArr;
        //newTool.linkDescriptions = linkDescArr;
        //newTool.tags = tagArr;
        //newTool.types = typeArr;
        //newTool.source = "biocatalogue";
        toolArr.push(curTool);
    }
    self.savedJSON = JSON.stringify(toolArr);
    fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/biocatalogue.json'), JSON.stringify(toolArr), function (err) {
        if (err) throw err;
    });

    self.onLoad();
};

//--- onLoad -----------------------------------------------------------------------------
Biocatalogue.prototype._onLoad = function(self){
    self._crud.fire(self);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Biocatalogue;