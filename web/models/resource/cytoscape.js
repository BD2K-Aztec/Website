var root = require.main.require;
//var BD2K = root('../../utility/bd2k.js');
//var Event = root('../../utility/event.js');
var BD2K = root('./utility/bd2k.js');
var Event = root('./utility/event.js');
var fs = require('fs');
var path = require('path');
var request = require('request');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Cytoscape
//

function Cytoscape() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Cytoscape.prototype._load = function (self, callback) {

    self.crud(callback);

    var data = require('../../scripts/resources/01_cytoscape_widgets.json');
    self.toolArr = [];
    self.numTools = data.length;
    self.countTools = 0;
    count = 0;

    for (var toolNum in data) {
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

        var currentSpot = self.toolArr.length;
        var url = "";
        if (curTool.pubmed_id)
            url = 'http://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?tool=ElixirToJsonConverter&' +
                'email=patrickptt@ucla.edu&ids=' + curTool.pubmed_id + '&format=json';

        if (curTool.pubmed_id) {
            delete curTool.pubmed_id;
            (function (arrayLoc) {
                request(url, function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        count++;
                        var rec = JSON.parse(body).records[0];
                        //if(rec.pmid){
                        //    self.toolArr[arrayLoc].pubmedID = rec.pmid;
                        //    console.log(arrayLoc + ": " + rec.pmid);
                        //}
                        //
                        //else if(rec.pmcid){
                        //    self.toolArr[arrayLoc].pubmedID = rec.pmcid;
                        //    console.log(arrayLoc + ": " + rec.pmcid);
                        //}
                        //
                        //else
                        if (rec.doi) {
                            self.toolArr[arrayLoc].publicationDOI = "doi:" + rec.doi;
                            console.log(arrayLoc + ": " + rec.doi);
                        }

                    }
                    else {
                        if (publicationID !== "")
                            console.log("STOP");
                    }
                    self.countTools++;
                    self.onLoad();
                });
            })(currentSpot);
        }
        else
            self.countTools++;

        self.toolArr.push(curTool);

        self.onLoad();
    }
    self.onLoad();
};

//--- onLoad -----------------------------------------------------------------------------
Cytoscape.prototype._onLoad = function(self){
    if(self.countTools === self.numTools){
        console.log(count);
        self.savedJSON = JSON.stringify(self.toolArr);
        fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/cytoscape.json'), JSON.stringify(self.toolArr), function (err) {
            if (err) throw err;
        });

        self._crud.fire(self);
    }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Cytoscape;