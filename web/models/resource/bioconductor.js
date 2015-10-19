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
//  Bioconductor
//

function Bioconductor() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Bioconductor.prototype._load = function (self, callback) {

    self.crud(callback);

    var data = require('../../scripts/resources/01_bioconductor_packages.json');
    var toolArr = [];

    for (var toolNum in data){
        var newTool = {};
        var curTool = data[toolNum];

        //var linkUrlArr = [];
        //var linkDescArr = [];
        //
        //var special = "";
        //if(curTool.documentation && (curTool.documentation.length === 0 || !curTool.documentation.trim())){
        //    special += curTool.documentation;
        //}
        //if(curTool.installation && (curTool.installation.length === 0 || !curTool.installation.trim())){
        //    special += curTool.installation;
        //}
        //if(curTool.systemReqs && (curTool.systemReqs.length === 0 || !curTool.systemReqs.trim())){
        //    special += curTool.systemReqs;
        //}
        //
        //newTool.name = curTool.name;
        //if(newTool.name === "a4")
        //    console.log("diffGeneAnalysis")
        //newTool.versionNum = curTool.version;
        //newTool.description = curTool.description;
        //newTool.sourceCodeURL = curTool.codeRepo;
        //if(curTool.license.length !== 0)
        //    newTool.license = curTool.license;
        //
        //linkUrlArr.push(curTool.packageLink);
        //linkDescArr.push("package download");
        //linkUrlArr.push(curTool.url);
        //linkDescArr.push("homepage");
        //
        //newTool.id = Math.random().toString();
        //newTool.authors = [];
        //for(var i in curTool.authors){
        //    var trimmed = curTool.authors[i].trim();
        //    if(trimmed.length !== 0){
        //        newTool.authors.push(trimmed);
        //    }
        //}
        //newTool.linkUrls = linkUrlArr;
        //newTool.linkDescriptions = linkDescArr;
        //newTool.dependencies = [];
        //for(var i in curTool.dependencies){
        //    var trimmed = curTool.dependencies[i].trim();
        //    if(trimmed.length !== 0){
        //        newTool.dependencies.push(trimmed);
        //    }
        //}
        //newTool.tags = [];
        //for(var i in curTool.biocViews){
        //    var trimmed = curTool.biocViews[i].trim();
        //    if(trimmed.length !== 0){
        //        newTool.tags.push(trimmed);
        //    }
        //}
        //for(var i in curTool.suggestions){
        //    var trimmed = curTool.suggestions[i].trim();
        //    if(trimmed.length !== 0){
        //        newTool.tags.push(trimmed);
        //    }
        //}
        //for(var i in curTool.imports){
        //    var trimmed = curTool.imports[i].trim();
        //    if(trimmed.length !== 0){
        //        newTool.tags.push(trimmed);
        //    }
        //}
        //newTool.maintainers = [];
        //for(var i in curTool.maintainers){
        //    var trimmed = curTool.maintainers[i].trim();
        //    if(trimmed.length === 0 || !trimmed.trim()){
        //        newTool.maintainers.push(trimmed);
        //    }
        //}
        //newTool.source = "bioconductor";
        curTool.dateCreated = new Date().toISOString();
        curTool.dateUpdated = new Date().toISOString();
        curTool.owners = ["adminOnly"];
        toolArr.push(curTool);
    }
    self.savedJSON = JSON.stringify(toolArr);
    console.log(toolArr.length);
    fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/bioconductor.json'), JSON.stringify(toolArr), function (err) {
        if (err) throw err;
    });

    self.onLoad();
};

//--- onLoad -----------------------------------------------------------------------------
Bioconductor.prototype._onLoad = function(self){
    self._crud.fire(self);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Bioconductor;