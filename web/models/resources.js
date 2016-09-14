var BD2K = require('../utility/bd2k.js');
var mongo = BD2K.mongo;
var Event = require('../utility/event.js');
var fs = require('fs');
var path = require('path');
var config = require('../config/app.json');
var solr = require('solr-client');
var Resource = require('./resource.js');

/**
 * @class Resources
 * @constructor
 * @classdesc Resources model: tools to check and handle resources from the [Resource]{@link Resource} model
 */
function Resources() {
    var self = this;

    this.length = function() { return self._length(self); };
    this.clone = function() { return self._clone(self); };
    this.combine = function(resourcesArr) { self._combine(self, resourcesArr); };

    this.group = [];
}

/**
 * Returns the number of resources in the group.
 * @memberof Resources
 * @function
 * @alias length
 * @returns {Number} number of resources in group
 */
Resources.prototype._length = function(self) {
    return self.group.length;
}

/**
 * Returns a copy of the resources.
 * @memberof Resources
 * @function
 * @alias clone
 * @returns {Resources} return a copy of the Resources object
 */
Resources.prototype._clone = function(self) {
    var r = new Resources(); 
    r.group = BD2K.clone(self.group); 
    return r;
}

/**
 * Combines all Resources in resourcesArr (no duplicate IDs) and places the combined array into self.group
 * @memberof Resources
 * @function
 * @alias combine
 * @param {Array} resourcesArr - array of Resources to combine
 * @returns {Array} combined arrays (no duplicate IDs)
 */
Resources.prototype._combine = function (self, resourcesArr) {
    var first = resourcesArr[0]; //First Resources model in the resourcesArr

    for (var i=first.group.length-1; i>=0; i--) { //Step through all Resource in first
        var resourceID = first.group[i].id; //ID of every Resource in first
        for (var j=1; j<resourcesArr.length; j++) { //go through all other Resources in resourcesArr
            var curResources = resourcesArr[j]; //get the current Resources
            var has = false; //initialize has as false, has indicates if the ID exists in curResources
            for (var k=0; k<curResources.group.length; k++){ //step through all Resource in curResources
                if (resourceID === curResources.group[k].id) { //if resourceID exists in the curResources
                    has = true; break;  //set has to true and break
                }
            }
            if (!has) { //if the resource does not exist yet???
                first.group.splice(i, 1); break; //remove the resource from first
            }
        }
    }

    self.group = first.group;
};

/**
 * Converts solr results to Resources
 * @memberof Resources
 * @function
 * @alias fromSolr
 * @param {Array} results - results returned by solr
 * @returns {Resources} returns a Resources model with solr results stored into group
 */
Resources.fromSolr = function (results) {
    var resources = new Resources();
    for (var i=0; i<results.response.docs.length; i++){ //go through all search results
        var doc = results.response.docs[i];
        var resource = new Resource(); 

        for(var key in doc){
            resource[key] = doc[key]; //connect solr result to a resource by key
        }
        resources.group.push(resource); //put resource into the return resources
    }
    return resources;
};

/**
TODO
*/
Resources.fromSolrSuggest = function(results, fields) {
    var resources = [];

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