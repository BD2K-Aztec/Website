var BD2K = require('../utility/bd2k.js');
var mongo = BD2K.mongo;
var Event = require('../utility/event.js');
var fs = require('fs');
var path = require('path');
var config = require('../config/app.json');
var solr = require('solr-client');
var Resource = require('./resource.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Resources
//
function Resources() {
    var self = this;

    this.length = function() { return self.group.length; };
    this.clone = function() { var r = new Resources(); r.group = BD2K.clone(self.group); return r; };
    this.combine = function(resourcesArr) { self._combine(self, resourcesArr); };

    this.group = [];
}

//--- combine ------------------------------------------------------------------------------
Resources.prototype._combine = function (self, resourcesArr) {
    var first = resourcesArr[0];

    for (var i=first.group.length-1; i>=0; i--) {
        var resourceID = first.group[i].id;
        for (var j=1; j<resourcesArr.length; j++) {
            var curResources = resourcesArr[j];
            var has = false;
            for (var k=0; k<curResources.group.length; k++){
                if (resourceID === curResources.group[k].id) { has = true; break; }
            }
            if (!has) { first.group.splice(i, 1); break; }
        }
    }

    self.group = first.group;
};

//--- fromSolr ------------------------------------------------------------------------------
Resources.fromSolr = function (results) {
    var resources = new Resources();
    for (var i=0; i<results.response.docs.length; i++){
        var doc = results.response.docs[i];
        var resource = new Resource();

        for(var key in doc){
            resource[key] = doc[key];
        }

        //resource.authors = doc.authors;
        //resource.description = doc.description;
        //publicationDOI
        //toolDOI
        //language
        //prevVersion
        //nextVersion
        //
        //
        //resource.id = doc.id;
        //resource.linkDescriptions = doc.linkDescriptions;
        //resource.linkUrls = doc.linkUrls;
        //resource.maintainers = doc.maintainers;
        //resource.name = doc.name;
        //resource.logo = doc.logo;
        //resource.source = doc.source;
        //resource.sourceCodeURL = doc.sourceCodeURL;
        //resource.tags = doc.tags;
        //resource.versionNum = doc.versionNum;
        //resource.versionDate = doc.versionDate;
        //resource.platforms = doc.platforms;
        //resource.types = doc.types;
        //resource.license = doc.license;
        resources.group.push(resource);
    }
    return resources;
};

Resources.fromSolrSuggest = function(results, fields) {
    var resources = [];
    console.log("Resources.fromSolr");

    var split = fields.name.split("+")
    var combine = ""
    for(var i = 0; i < split.length; i++)
    {
        combine += split[i] + " "
    }

    fields.name = combine.trim()

    if(fields.searchType == "resources") {
        //console.log("results.response: " + JSON.stringify(results));
        for (var i = 0; i < results.response.docs.length; i++) {
            var doc = results.response.docs[i];

            if (resources.indexOf(results.response.docs[i]["name"]) < 0) {
                resources.push(results.response.docs[i]["name"]);
            }
        }
    }

    else if(fields.searchType == "tags")
    {
        tag_dict = {}
        for (var i = 0; i < results.response.docs.length; i++) {
            var doc = results.response.docs[i];
            for(var j = 0; j < doc["tags"].length; j++)
            {
                tag_dict[doc["tags"][j].toLowerCase()] = 1
            }
        }
        for(key in tag_dict)
        {
            if(key.substring(0,fields.name.length).toUpperCase() == fields.name.toUpperCase() && tag_dict[key] == 1) {
                resources.push(key)
                tag_dict[key] = 0;
            }
        }
        for(key in tag_dict)
        {
            for(var k = 0; k < key.length-fields.name.length+1; k++)
            {
                if(key.substring(k,k+fields.name.length).toUpperCase() == fields.name.toUpperCase() && tag_dict[key] == 1) {
                    resources.push(key)
                    tag_dict[key] = 0;
                }
            }

        }
    }

    return resources;

};


//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Resources;