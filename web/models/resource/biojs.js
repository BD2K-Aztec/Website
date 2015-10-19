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
//  Biojs
//
function Biojs() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Biojs.prototype._load = function (self, callback) {

    self.crud(callback);

    var data = require('../../scripts/resources/01_biojs_packages.json');
    var toolArr = [];

    for (var toolNum in data){
        var newTool = {};
        var curTool = data[toolNum];

        //var linkUrlArr = [];
        //var linkDescArr = [];
        //var authorArr = [];
        //var dependencyArr = [];
        //var tagArr = [];
        //var maintainerArr = [];
        //
        ////dependencies
        //for(var propName in curTool.dependencies){
        //    dependencyArr.push(propName + ": " + curTool.dependencies[propName])
        //}
        //
        ////tags
        //for(var tag in curTool.keywords){
        //    tagArr.push(curTool.keywords[tag]);
        //}
        //
        //newTool.name = curTool.name;
        //newTool.versionNum = curTool.version;
        //newTool.description = curTool.description;
        //newTool.sourceCodeURL = curTool.repository.url;
        //newTool.license = curTool.license;
        //
        //maintainerArr.push(curTool.maintainers[0].name);
        //
        ////author
        //if(curTool.author){
        //    authorArr.push(curTool.author.name);
        //
        //}
        ////homepage
        //linkUrlArr.push(curTool.bugs.url);
        //linkDescArr.push("bugs");
        //linkUrlArr.push(curTool.homepage);
        //linkDescArr.push("homepage");
        //for(var license in curTool.licenses){
        //    linkUrlArr.push(curTool.licenses[license].url);
        //    linkDescArr.push("license: " + curTool.licenses[license].type);
        //}
        //
        //newTool.id = Math.random().toString();
        //newTool.authors = authorArr;
        //newTool.linkUrls = linkUrlArr;
        //newTool.linkDescriptions = linkDescArr;
        //newTool.dependencies = dependencyArr;
        //newTool.tags = tagArr;
        //newTool.maintainers = maintainerArr;
        //newTool.source = "biojs";
        ////newTool.types = ["Tool (visualizer)"];
        curTool.dateCreated = new Date().toISOString();
        curTool.dateUpdated = new Date().toISOString();
        curTool.owners = ["adminOnly"];
        toolArr.push(curTool);
    }
    self.savedJSON = JSON.stringify(toolArr);
    fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/biojs.json'), JSON.stringify(toolArr), function (err) {
        if (err) throw err;
    });

    self.onLoad();
};

//--- onLoad -----------------------------------------------------------------------------
Biojs.prototype._onLoad = function(self){
    self._crud.fire(self);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Biojs;