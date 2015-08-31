var BD2K = require('../utility/bd2k.js');
var Event = require('../utility/event.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Tool
//
function Tool(options) {
    var self = this;

    this.load = function (callback) { return self._load(self, callback); };
    this.onLoad = function () { return self._onLoad(self); };
    this.save = function (callback) { return self._save(self, callback); };
    this.onSave = function () { return self._onSave(self); };
    this.filters = function() { return self._filters(self); };

    var crud = new Event();

    options = options || {};
    self.options = options;

    this._crud = crud;
    this.crud = crud.register;
}

//--- filters ------------------------------------------------------------------------------
Tool.prototype._filters = function(self) {
    var filters = {};

    //var obj = {};
    //obj.key = "tool";
    //obj.label = "Tool";
    //filters["tool"] = obj;

    obj = {};
    obj.key = "name";
    obj.label = "Name";
    filters["name"] = obj;

    obj = {};
    obj.key = "tags";
    obj.label = "Tags";
    filters["tags"] = obj;

    //obj = {};
    //obj.key = "logo";
    //obj.label = "Logo";
    //filters["logo"] = obj;

    obj = {};
    obj.key = "description";
    obj.label = "Description";
    filters["description"] = obj;
    //
    //obj = {};
    //obj.key = "sourceCodeURL";
    //obj.label = "Source Code URL";
    //filters["sourceCodeURL"] = obj;
    //
    //obj = {};
    //obj.key = "pubmedID";
    //obj.label = "PubMed ID";
    //filters["pubmedID"] = obj;

    obj = {};
    obj.key = "language";
    obj.label = "Language";
    filters["language"] = obj;

    obj = {};
    obj.key = "funding";
    obj.label = "Funders";
    filters["funding"] = obj;

    //obj = {};
    //obj.key = "versionNumber";
    //obj.label = "Latest Version Number";
    //filters["versionNumber"] = obj;

    //obj = {};
    //obj.key = "versionDate";
    //obj.label = "Latest Version Release Date";
    //filters["versionDate"] = obj;

    //obj = {};
    //obj.key = "prevVersion";
    //obj.label = "Previous Version";
    //filters["prevVersion"] = obj;

    //obj = {};
    //obj.key = "nextVersion";
    //obj.label = "Next Version";
    //filters["nextVersion"] = obj;

    obj = {};
    obj.key = "source";
    obj.label = "Source Repository";
    filters["source"] = obj;
    //
    //obj = {};
    //obj.key = "linkDescriptions";
    //obj.label = "Link Description";
    //filters["linkDescriptions"] = obj;

    //obj = {};
    //obj.key = "linkURLs";
    //obj.label = "Link URL";
    //filters["linkURLs"] = obj;

    obj = {};
    obj.key = "authors";
    obj.label = "Authors";
    filters["authors"] = obj;

    obj = {};
    obj.key = "institutions";
    obj.label = "Institutions";
    filters["institutions"] = obj;

    obj = {};
    obj.key = "types";
    obj.label = "Software Types";
    filters["types"] = obj;

    obj = {};
    obj.key = "domains";
    obj.label = "Biological Domains";
    filters["domains"] = obj;

    obj = {};
    obj.key = "platforms";
    obj.label = "Platforms";
    filters["platforms"] = obj;

    //obj = {};
    //obj.key = "inputFiles";
    //obj.label = "Input File Type";
    //filters["inputFiles"] = obj;

    //obj = {};
    //obj.key = "outputFiles";
    //obj.label = "Output File Type";
    //filters["outputFiles"] = obj;

    //obj = {};
    //obj.key = "upstream";
    //obj.label = "Upstream Tools";
    //filters["upstream"] = obj;

    //obj = {};
    //obj.key = "downstream";
    //obj.label = "Downstream Tools";
    //filters["downstream"] = obj;

    obj = {};
    obj.key = "dependencies";
    obj.label = "Dependencies";
    filters["dependencies"] = obj;

    obj = {};
    obj.key = "maintainers";
    obj.label = "Maintainers";
    filters["maintainers"] = obj;
    return filters;
};

//--- load ------------------------------------------------------------------------------
Tool.prototype._load = function(self, callback) {
    self.crud(callback);

    var id = self.options;
    self.empty = false;

    var selectSql = "SELECT * FROM Tools WHERE ToolID = ?; SELECT * FROM Links WHERE ToolID = ?; SELECT * FROM ToolTypes WHERE ToolID = ?;" +
        "SELECT * FROM ToolAuthors WHERE ToolID = ?; SELECT * FROM Institutes WHERE ToolID = ?; SELECT * FROM Fundings WHERE ToolID = ?;" +
        "SELECT * FROM ToolDomains WHERE ToolID = ?; SELECT * FROM PlatformType WHERE ToolID = ?; SELECT * FROM ToolInputs WHERE ToolID = ?;" +
        "SELECT * FROM ToolOutputs WHERE ToolID = ?;";

    var con = {};

    // ------- onSql -----------
    con.onSql = function(rows) {
        var mainRow = rows[0];
        if(mainRow.length === 0){
            self.empty = true;
            self.Name = "";
            self.Logo = "";
            self.Description = "";
            self.SourceCode = "";
            self.PubMedID = "";
            self.VersionNumber = "";
            self.VersionDate = "";
            self.PreviousVersion = "";
            self.NextVersion = "";
            self.onLoad();
        }
        else{
            self.Name = mainRow[0].Name;
            self.Logo = mainRow[0].Logo;
            self.Description = mainRow[0].Description;
            self.SourceCode = mainRow[0].SourceCode;
            self.PubMedID = mainRow[0].PubMedID;
            self.VersionNumber = mainRow[0].VersionNumber;
            self.VersionDate = mainRow[0].VersionDate;
            self.PreviousVersion = mainRow[0].PreviousVersion;
            self.NextVersion = mainRow[0].NextVersion;
            self.onLoad();
        }

        var linkRow = rows[1];
        var linkArr = [];

        for (var i = 0; i < linkRow.length; i++) {
            var link = {};
            link.Url = linkRow[i].Link;
            link.Description = linkRow[i].LinkDescription;
            linkArr.push(link);
        }

        self.Links = linkArr;
        self.onLoad();

        var typeRow = rows[2];
        self.preTypes = [];
        self.numTypes = typeRow.length;

        for (var i = 0; i < typeRow.length; i++) {
            var getType = "SELECT * FROM Types WHERE TypeID = ?";
            BD2K.mysql(getType, con.onSqlType, typeRow[i].TypeID);
        }
        if(self.preTypes.length === self.numTypes){self.Types = self.preTypes;delete self.preTypes;delete self.numTypes;}
        self.onLoad();

        var authorRow = rows[3];
        self.preAuthors = [];
        self.numAuthors = authorRow.length;

        for (var i = 0; i < authorRow.length; i++) {
            var getAuthor = "SELECT * FROM Authors WHERE AuthorID = ?";
            BD2K.mysql(getAuthor, con.onSqlAuthor, authorRow[i].AuthorID);
        }
        if(self.preAuthors.length === self.numAuthors){self.Authors = self.preAuthors;delete self.preAuthors;delete self.numAuthors;}
        self.onLoad();

        var instituteRow = rows[4];
        var instituteArr = [];

        for (var i = 0; i < instituteRow.length; i++) {
            instituteArr.push(instituteRow[i].Institution);
        }

        self.Institutes = instituteArr;
        self.onLoad();

        var fundingRow = rows[5];
        var fundingArr = [];

        for (var i = 0; i < fundingRow.length; i++) {
            fundingArr.push(fundingRow[i].Funding);
        }

        self.Funding = fundingArr;
        self.onLoad();

        var domainRow = rows[6];
        self.preDomains = [];
        self.numDomains = domainRow.length;

        for (var i = 0; i < domainRow.length; i++) {
            var getDomain = "SELECT * FROM BiologicalDomains WHERE DomainID = ?";
            BD2K.mysql(getDomain, con.onSqlBioDomains, domainRow[i].DomainID);
        }
        if(self.preDomains.length === self.numDomains){self.Domains = self.preDomains;delete self.preDomains;delete self.numDomains;}
        self.onLoad();

        var platformRow = rows[7];
        self.prePlatforms = [];
        self.numPlatforms = platformRow.length;

        for (var i = 0; i < platformRow.length; i++) {
            var getPlatform = "SELECT * FROM Platforms WHERE PlatformID = ?";
            BD2K.mysql(getPlatform, con.onSqlPlatforms, platformRow[i].PlatformID);
        }
        if(self.prePlatforms.length === self.numPlatforms){self.Platforms = self.prePlatforms;delete self.prePlatforms;delete self.numPlatforms;}
        self.onLoad();

        var inputRow = rows[8];
        self.preFileInputs = [];
        self.numFileInputs = inputRow.length;

        for (var i = 0; i < inputRow.length; i++) {
            var getFileInput = "SELECT * FROM FileTypes WHERE FileID = ?";
            BD2K.mysql(getFileInput, con.onSqlFileInput, inputRow[i].FileID);
        }
        if(self.preFileInputs.length === self.numFileInputs){self.FileInputs = self.preFileInputs;delete self.preFileInputs;delete self.numFileInputs;}
        self.onLoad();

        var outputRow = rows[9];
        self.preFileOutputs = [];
        self.numFileOutputs = outputRow.length;

        for (var i = 0; i < outputRow.length; i++) {
            var getFileOutput = "SELECT * FROM FileTypes WHERE FileID = ?";
            BD2K.mysql(getFileOutput, con.onSqlFileOutput, outputRow[i].FileID);
        }
        if(self.preFileOutputs.length === self.numFileOutputs){self.FileOutputs = self.preFileOutputs;delete self.preFileOutputs;delete self.numFileOutputs;}
        self.onLoad();
    };

    // ------- onSqlType -----------
    con.onSqlType = function(row) {
        var type = {};
        type.TypeID = row[0].TypeID;
        type.Type = row[0].Type;
        self.preTypes.push(type);
        if(self.preTypes.length === self.numTypes){self.Types = self.preTypes;delete self.preTypes;delete self.numTypes;}
        self.onLoad();
    };

    // ------- onSqlAuthor -----------
    con.onSqlAuthor = function(row){
        var author = {};
        author.AuthorID = row[0].AuthorID;
        author.AuthorFirst = row[0].AuthorFirst;
        author.AuthorLast = row[0].AuthorLast;
        self.preAuthors.push(author);
        if(self.preAuthors.length === self.numAuthors){self.Authors = self.preAuthors;delete self.preAuthors;delete self.numAuthors;}
        self.onLoad();
    };

    // ------- onSqlBioDomains -----------
    con.onSqlBioDomains = function(row){
        var domain = {};
        domain.DomainID = row[0].DomainID;
        domain.Type = row[0].Type;
        self.preDomains.push(domain);
        if(self.preDomains.length === self.numDomains){self.Domains = self.preDomains;delete self.preDomains;delete self.numDomains;}
        self.onLoad();
    };

    // ------- onSqlPlatforms -----------
    con.onSqlPlatforms = function(row){
        var platform = {};
        platform.PlatformID = row[0].PlatformID;
        platform.Platform = row[0].Platform;
        self.prePlatforms.push(platform);
        if(self.prePlatforms.length === self.numPlatforms){self.Platforms = self.prePlatforms;delete self.prePlatforms;delete self.numPlatforms;}
        self.onLoad();
    };

    // ------- onSqlFileInput -----------
    con.onSqlFileInput = function(row){
        var fileInput = {};
        fileInput.FileID = row[0].FileID;
        fileInput.Type = row[0].Type;
        self.preFileInputs.push(fileInput);
        if(self.preFileInputs.length === self.numFileInputs){self.FileInputs = self.preFileInputs;delete self.preFileInputs;delete self.numFileInputs;}
        self.onLoad();
    };

    // ------- onSqlFileOutput -----------
    con.onSqlFileOutput = function(row){
        var fileOutput = {};
        fileOutput.FileID = row[0].FileID;
        fileOutput.Type = row[0].Type;
        self.preFileOutputs.push(fileOutput);
        if(self.preFileOutputs.length === self.numFileOutputs){self.FileOutputs = self.preFileOutputs;delete self.preFileOutputs;delete self.numFileOutputs;}
        self.onLoad();
    };

    BD2K.mysql(selectSql, con.onSql, [id,id,id,id,id,id,id,id,id,id]);

    var workFlow = [
        "MATCH (n:Tool {id:" + id + "})-[:UpstreamOf]-(Workflow) Return n, Workflow"
    ].join('\n');

    // ------- onWorkFlow -----------
    con.onWorkFlow = function(results){
        self.workflow = results;
        self.onLoad();
    };

    BD2K.neo4j(workFlow, con.onWorkFlow);

    // ------- onVersions -----------
    con.onVersions = function(results){
        self.workflow = results;
        self.onLoad();
    };

    var versions = [
        "MATCH (n:Tool {id:" + id + "})-[:NextVersion]-(Versions) Return n, Versions"
    ].join('\n');

    BD2K.neo4j(versions, onVersions);
};

//--- onLoad ------------------------------------------------------------------------------
Tool.prototype._onLoad = function(self){
    if (BD2K.has([self.NextVersion, self.Links, self.Types, self.Authors, self.Institutes, self.Funding, self.Domains, self.Platforms, self.FileInputs, self.FileOutputs, self.workflow, self.versions ])) {
        self._crud.fire(self);
    }
};

//--- save ------------------------------------------------------------------------------
Tool.prototype._save = function (self, callback) {

    self.crud(callback);

    self.name = self.options.name.trim();
    self.logo = self.options.logo.trim();
    self.description = self.options.description.trim();
    self.sourceCodeURL = self.options.sourceCodeURL.trim();
    self.pubmedID = self.options.pubmedID.trim();
    if(self.pubmedID === ''){ self.pubmedID = null; }
    self.versionNum = self.options.versionNum.trim();
    self.versionDate = self.options.versionDate.trim();
    self.prevVersion = self.options.prevVersion.trim();
    self.nextVersion = self.options.nextVersion.trim();

    self.funding = self.options.funding;
    self.linkDescriptions = self.options.linkDescriptions;
    self.linkSourceURLs = self.options.linkSourceURLs;
    self.authorFirstNames = self.options.authorFirstNames;
    self.authorLastNames = self.options.authorLastNames;
    self.institutes = self.options.institutesInput;
    self.types = self.options.types;
    self.domains = self.options.domains;
    self.platforms = self.options.platforms;
    self.inputFiles = self.options.inputFiles;
    self.outputFiles = self.options.outputFiles;
    self.upstreams = self.options.upstreams;
    self.downstreams = self.options.downstreams;

    var solrDoc = {};
    solrDoc.name = self.name;
    solrDoc.logo = self.logo;
    solrDoc.description = self.description;
    solrDoc.sourceCodeURL = self.sourceCodeURL;
    solrDoc.pubmedID = self.pubmedID;
    solrDoc.versionNum = self.versionNum;
    solrDoc.versionDate = self.versionDate;
    solrDoc.prevVersion = self.prevVersion;
    solrDoc.nextVersion = self.nextVersion;

    solrDoc.funding = self.funding;
    solrDoc.linkDescriptions = self.linkDescriptions;
    solrDoc.linkSourceURLs = self.linkSourceURLs;
    solrDoc.authorFirstNames = self.authorFirstNames;
    solrDoc.authorLastNames = self.authorLastNames;
    solrDoc.institutes = self.institutesInput;
    solrDoc.types = self.types;
    solrDoc.domains = self.domains;
    solrDoc.platforms = self.platforms;
    solrDoc.inputFiles = self.inputFiles;
    solrDoc.outputFiles = self.outputFiles;
    solrDoc.upstreams = self.upstreams;
    solrDoc.downstreams = self.downstreams;

    var con = {};

    // ------- onSolR -----------
    con.onSolR = function(obj){
        console.log(obj);
        self.checkSolr = true;
        self.onSave();
    };

    BD2K.solrAdd(solrDoc, con.onSolR);

    var insertLinkDescriptions = "";
    var insertLinkUrls = "";
    for(i= 0; i < self.linkDescriptions.length;i++){
        insertLinkDescriptions += self.linkDescriptions[i] + "|||";
        insertLinkUrls += self.linkSourceURLs[i] + "|||";
    }

    var insertTypes = "";
    for(i= 0; i < self.types.length;i++){
        insertTypes += self.types[i] + "|||";
    }

    var insertFirstNames = "";
    var insertLastNames = "";
    for(i= 0; i < self.authorFirstNames.length;i++){
        insertFirstNames += self.authorFirstNames[i] + "|||";
        insertLastNames += self.authorLastNames[i] + "|||";
    }

    var insertInstitutes = "";
    for(i= 0; i < self.institutes.length;i++){
        insertInstitutes += self.institutes[i] + "|||";
    }

    var insertFunding = "";
    for(i= 0; i < self.funding.length;i++){
        insertFunding += self.funding[i] + "|||";
    }

    var insertDomain = "";
    for(i= 0; i < self.domains.length;i++){
        insertDomain += self.domains[i] + "|||";
    }

    var insertPlatform = "";
    for(i= 0; i < self.platforms.length;i++){
        insertPlatform += self.platforms[i] + "|||";
    }

    var insertInputFiles = "";
    for(i= 0; i < self.inputFiles.length;i++){
        insertInputFiles += self.inputFiles[i] + "|||";
    }

    var insertOutputFiles = "";
    for(i= 0; i < self.outputFiles.length;i++){
        insertOutputFiles += self.outputFiles[i] + "|||";
    }

    // ------- onSql -----------
    con.onSolR = function(rows){
        self.toolID = rows[0][0].id;

        var node = [
            "CREATE (n:Tool {id:" + self.toolID + ", name:'" + self.name + "'}) RETURN n"
        ].join('\n');
        BD2K.neo4j(node, function(results){
            self.countUpstream = 0;
            self.countDownstream = 0;

            for(var i = 0; i < self.upstreams.length; i++){
                var upstreamCypher = [
                    "MATCH (a:Tool {id:" + self.toolID + "}), (b:Tool {id:" + self.upstreams[i] + "})",
                    "CREATE (b)-[:UpstreamOf]->(a)"
                ].join('\n');
                BD2K.neo4j(upstreamCypher, con.onNeo4jUpstream);
            }

            if(self.countUpstream === self.upstreams.length){
                delete self.countUpstream;
                self.checkUpstream = true;
                self.onSave();
            }

            for(var i = 0; i < self.downstreams.length; i++){
                var downstreamCypher = [
                    "MATCH (a:Tool {id:" + self.toolID + "}), (b:Tool {id:" + self.downstreams[i] + "})",
                    "CREATE (a)-[:UpstreamOf]->(b)"
                ].join('\n');
                BD2K.neo4j(downstreamCypher, con.onNeo4jDownstream);
            }

            if(self.countDownstream === self.downstreams.length){
                delete self.countDownstream;
                self.checkDownstream = true;
                self.onSave();
            }

            if(self.prevVersion === ""){
                self.checkPrevious = true;
                self.onSave();
            }
            else{
                var previousVersionCypher = [
                    "MATCH (a:Tool {id:" + self.toolID + "}), (b:Tool {id:" + self.prevVersion + "})",
                    "CREATE (b)-[:NextVersion]->(a)"
                ].join('\n');
                BD2K.neo4j(previousVersionCypher, function(result){ self.checkPrevious = true; self.onSave(); });
            }

            if(self.nextVersion === ""){
                self.checkNext = true;
                self.onSave();
            }
            else{
                var nextVersionCypher = [
                    "MATCH (a:Tool {id:" + self.toolID + "}), (b:Tool {id:" + self.nextVersion + "})",
                    "CREATE (a)-[:NextVersion]->(b)"
                ].join('\n');
                BD2K.neo4j(nextVersionCypher, function(result){ self.checkNext = true; self.onSave(); });
            }
        });
    };

    // ------- onNeo4jUpstream -----------
    con.onNeo4jUpstream = function(result){
        self.countUpstream++;
        if(self.countUpstream === self.upstreams.length){
            delete self.countUpstream;
            self.checkUpstream = true;
            self.onSave();
        }
    };

    // ------- onNeo4jDownstream -----------
    con.onNeo4jDownstream = function(result){
        self.countDownstream++;
        if(self.countDownstream === self.downstreams.length){
            delete self.countDownstream;
            self.checkDownstream = true;
            self.onSave();
        }
    };

    self.toolID = -1;
    var callProcedure = "CALL InsertTool(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    BD2K.mysql(callProcedure, con.onSql, [self.name, self.logo, self.description, self.sourceCodeURL, self.pubmedID, self.versionNum, self.versionDate, self.prevVersion, self.nextVersion,
        insertLinkDescriptions, insertLinkUrls, insertTypes, insertFirstNames, insertLastNames, insertInstitutes, insertFunding, insertDomain, insertPlatform, insertInputFiles, insertOutputFiles]);
};

//--- onSave ------------------------------------------------------------------------------
Tool.prototype._onSave = function(self){
    if (BD2K.has([self.toolID, self.checkUpstream, self.checkDownstream, self.checkNext, self.checkPrevious, self.checkSolr])) {
        self._crud.fire({id: self.toolID, res: self, strRes: self.results});
    }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Tool;