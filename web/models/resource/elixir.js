var root = require.main.require;
//var BD2K = root('../../utility/bd2k.js');
//var Event = root('../../utility/event.js');
var BD2K = root('./utility/bd2k.js');
var Event = root('./utility/event.js');
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var request = require('request');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Elixir
//
function Elixir() {
    var self = this;

    this.onLoad = function (rows) { return self._onLoad(self, rows); };
    this.load = function (callback) { return self._load(self, callback); };

    var crud = new Event();

    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
Elixir.prototype._load = function (self, callback) {

    self.crud(callback);
    var data;
    count = 0;
    try {
        var fileData = fs.readFileSync(path.join(__dirname, '../../scripts/resources/elixir.xml'), 'ascii');
        xml2js.parseString(fileData, function (err, result) {
            self.toolArr = [];
            self.numTools = result.resources.resource.length;
            self.countTools = 0;

            for (var toolNum in result.resources.resource){
                var newTool = {};
                var curTool = result.resources.resource[toolNum];

                var linkUrlArr = [];
                var linkDescArr = [];
                var maintainerArr = [];
                var maintainerEmailsArr = [];
                var authorArr = [];
                var authorEmailsArr = [];
                var fundingArr = [];
                var tagArr = [];
                var institutionsArr = [];
                var platformArr = [];
                var typeArr = [];
                var inputArr = [];
                var outputArr = [];
                var domainArr = [];

                //
                //for(var use in curTool.uses){
                //    tagArr.push(curTool.uses[use].usesName[0])
                //}
                for(var mirror in curTool.mirror){
                    linkUrlArr.push(curTool.mirror[mirror]);
                    linkDescArr.push("Mirror Homepage");
                }
                //for(var collection in curTool.collection){
                //    tagArr.push(curTool.collection[collection]);
                //}
                for(var contact in curTool.contact){
                    if(curTool.contact[contact].contactName) {
                        maintainerArr.push(curTool.contact[contact].contactName[0]);
                    }
                    else{
                        maintainerArr.push("Not Available");
                    }
                    if(curTool.contact[contact].contactEmail){
                        maintainerEmailsArr.push(curTool.contact[contact].contactEmail[0]);
                    }
                    else{
                        maintainerEmailsArr.push("");
                    }
                }
                if(curTool.credits){
                    for(var inst in curTool.credits[0].creditsInstitution){
                        institutionsArr.push(curTool.credits[0].creditsInstitution[inst]);
                    }
                    for(var dev in curTool.credits[0].creditsDeveloper){
                        authorArr.push(curTool.credits[0].creditsDeveloper[dev]);
                        authorEmailsArr.push("");
                    }
                    for(var fund in curTool.credits[0].creditsFunding){
                        fundingArr.push(curTool.credits[0].creditsFunding[fund]);
                    }
                }
                for(var func in curTool.function){
                    for(var input in curTool.function[func].input){
                        if(curTool.function[func].input[input].dataFormat){
                            inputArr.push(curTool.function[func].input[input].dataFormat[0]._)
                        }
                        if(curTool.function[func].input[input].dataType){
                            inputArr.push(curTool.function[func].input[input].dataType[0]._)
                        }
                    }
                    for(var output in curTool.function[func].output){
                        if(curTool.function[func].output[output].dataFormat){
                            outputArr.push(curTool.function[func].output[output].dataFormat[0]._)
                        }
                        if(curTool.function[func].output[output].dataType){
                            outputArr.push(curTool.function[func].output[output].dataType[0]._)
                        }
                    }
                }
                if(curTool.docs){
                    if(curTool.docs[0].docsDownload){
                        newTool.sourceCodeURL = curTool.docs[0].docsDownload[0];
                        linkUrlArr.push(curTool.docs[0].docsDownload[0]);
                        linkDescArr.push("Download Page");
                    }

                    if(curTool.docs[0].docsHome){
                        linkUrlArr.push(curTool.docs[0].docsHome[0]);
                        linkDescArr.push("Documentation Home");
                    }

                    if(curTool.docs[0].docsCitationInstructions){
                        linkUrlArr.push(curTool.docs[0].docsCitationInstructions[0]);
                        linkDescArr.push("Citation Instructions");
                    }

                    if(curTool.docs[0].docsTermsOfUse){
                        linkUrlArr.push(curTool.docs[0].docsTermsOfUse[0]);
                        linkDescArr.push("Terms of Use");
                    }
                }
                if(curTool.homepage){
                    linkUrlArr.push(curTool.homepage[0]);
                    linkDescArr.push("Homepage");
                }
                for(var platform in curTool.interface){
                    platformArr.push(curTool.interface[platform].interfaceType[0]._)
                }

                for(var platform in curTool.platform){
                    platformArr.push(curTool.platform[platform]._)
                }
                if(curTool.resourceType.length > 1){
                    console.log("STOP");
                }
                typeArr.push(curTool.resourceType[0]._);
                for(var type in curTool.topic){
                    var tag = "";
                    if(curTool.topic[type]._)
                        tag = curTool.topic[type]._;
                    else
                        tag = curTool.topic[type];
                    tagArr.push(tag);
                    if(tag.match(/(\s|^)proteins?(\s|$)|(\s|^)proteome(\s|$)|(\s|^)proteomics?(\s|$)/i)){
                        domainArr.push("Proteomics");
                    }
                    if(tag.match(/(\s|^)genome(\s|$)|(\s|^)genomics?(\s|$)|(\s|^)genes?(\s|$)|(\s|^)dna(\s|$)|(\s|^)rna(\s|$)|(\s|^)plasmid(\s|$)|(\s|^)rna-seq(\s|$)/i)){
                        domainArr.push("Genomics");
                    }
                    if(tag.match(/(\s|^)metabolome(\s|$)|(\s|^)metabolomics?(\s|$)|(\s|^)metabolites?(\s|$)/i)){
                        domainArr.push("Metabolomics");
                    }
                    if(tag.match(/(\s|^)metagenomics?(\s|$)/i)){
                        domainArr.push("Metagenomics");
                    }
                    if(tag.match(/(\s|^)medical(\s|$)|(\s|^)biomedical(\s|$)/i)){
                        domainArr.push("Biomedical");
                    }
                    if(tag.match(/(\s|^)epigenomics?(\s|$)/i)){
                        domainArr.push("Epigenomics");
                    }
                }
                //tags
                for(var tag in curTool.tags){
                    var tag = curTool.tag[tag];
                    tagArr.push(tag);
                    if(tag.match(/(\s|^)proteins?(\s|$)|(\s|^)proteome(\s|$)|(\s|^)proteomics?(\s|$)/i)){
                        domainArr.push("Proteomics");
                    }
                    if(tag.match(/(\s|^)genome(\s|$)|(\s|^)genomics?(\s|$)|(\s|^)genes?(\s|$)|(\s|^)dna(\s|$)|(\s|^)rna(\s|$)|(\s|^)plasmid(\s|$)|(\s|^)rna-seq(\s|$)/i)){
                        domainArr.push("Genomics");
                    }
                    if(tag.match(/(\s|^)metabolome(\s|$)|(\s|^)metabolomics?(\s|$)|(\s|^)metabolites?(\s|$)/i)){
                        domainArr.push("Metabolomics");
                    }
                    if(tag.match(/(\s|^)metagenomics?(\s|$)/i)){
                        domainArr.push("Metagenomics");
                    }
                    if(tag.match(/(\s|^)medical(\s|$)|(\s|^)biomedical(\s|$)/i)){
                        domainArr.push("Biomedical");
                    }
                    if(tag.match(/(\s|^)epigenomics?(\s|$)/i)){
                        domainArr.push("Epigenomics");
                    }
                }
                var uniqueDomains = domainArr.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);

                newTool.name = curTool.name[0];
                if(curTool.version)
                    newTool.versionNum = curTool.version[0];
                newTool.description = curTool.description[0];
                if(curTool.license){
                    newTool.licenses = [curTool.license[0]._];
                    newTool.licenseUrls = [""];
                }
                if(curTool.language){
                    if(curTool.language.length < 3)
                        newTool.language = curTool.language[0]._;
                }

                newTool.source = "elixir";
                newTool.maintainers = maintainerArr;
                newTool.maintainerEmails = maintainerEmailsArr;
                newTool.authors = authorArr;
                newTool.authorEmails = authorEmailsArr;
                newTool.funding = fundingArr;
                newTool.institutions = institutionsArr;
                newTool.linkUrls = linkUrlArr;
                newTool.linkDescriptions = linkDescArr;
                newTool.platforms = platformArr;
                newTool.types = typeArr;
                newTool.tags = BD2K.removeDuplicates(tagArr);
                newTool.inputFiles = BD2K.removeDuplicates(inputArr);
                newTool.outputFiles = BD2K.removeDuplicates(outputArr);
                newTool.domains = uniqueDomains;
                var publicationID = "";
                if(curTool.publications){
                    if(curTool.publications[0].publicationsPrimaryID){
                        publicationID = curTool.publications[0].publicationsPrimaryID[0];
                        if(publicationID.lastIndexOf("doi:", 0) === 0){
                            publicationID = publicationID.substring(4);
                        }
                    }
                }

                var url = 'http://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?tool=ElixirToJsonConverter&' +
                    'email=patrickptt@ucla.edu&ids=' + publicationID + '&format=json';

                newTool.dateCreated = new Date().toISOString();
                newTool.dateUpdated = new Date().toISOString();
                newTool.owners = ["adminOnly"];
                self.toolArr.push(newTool);
                var currentSpot = self.toolArr.length - 1;

                if(publicationID !== ""){
                    (function(arrayLoc) {
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
                                if(rec.doi){
                                    self.toolArr[arrayLoc].publicationDOI = "doi:" + rec.doi;
                                    console.log(arrayLoc + ": " + rec.doi);
                                }

                            }
                            else{
                                if(publicationID !== "")
                                    console.log("STOP");
                            }
                            self.countTools++;
                            self.onLoad();
                        });
                    })(currentSpot);
                }
                else
                    self.countTools++;
            }

            self.onLoad();
        });

    } catch (ex){console.log(ex);}

};

//--- onLoad -----------------------------------------------------------------------------
Elixir.prototype._onLoad = function(self){
    if(self.countTools === self.numTools){
        console.log(count);
        self.savedJSON = JSON.stringify(self.toolArr);
        fs.writeFile(path.join(__dirname, '../../scripts/resources/solr/elixir.json'), JSON.stringify(self.toolArr), function (err) {
            if (err) throw err;
        });

        self._crud.fire(self);
    }

};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Elixir;