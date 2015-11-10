var Event = require('../../../utility/event.js');
var BD2K = require('../../../utility/bd2k.js');
var config = require('../../../config/app.json');
var solr = require('solr-client');


var options = {};
options.core = "BD2K";
options.host = config.solrHost;
options.port = config.solrPort;
var client = solr.createClient(options);

var biocatalogue = require('../../../scripts/resources/solr/biocatalogue.json');
var bioconductor = require('../../../scripts/resources/solr/bioconductor.json');
var biojs = require('../../../scripts/resources/solr/biojs.json');
var elixir = require('../../../scripts/resources/solr/elixir.json');
var galaxy = require('../../../scripts/resources/solr/galaxy.json');
var cytoscape = require('../../../scripts/resources/solr/cytoscape.json');
var user = require('../../../scripts/resources/solr/user.json');

var insert_all = biocatalogue.concat(bioconductor).concat(biojs).concat(elixir).concat(galaxy).concat(cytoscape).concat(user);

count = 0;
finalMax = 0;
BD2K.solr.search({id:-1}, function(result){
    console.log(result);
    var maxID = parseInt(result.response.docs[0].description);
    finalMax = maxID + insert_all.length;

    for(var toolNum in insert_all){
        var curTool = insert_all[toolNum];
        curTool.id = maxID;
        maxID++;
        BD2K.solr.add(curTool, function(result, maxID){
            console.log(maxID[0]);
            count++;
            if(count === insert_all.length){
                BD2K.solr.delete("id", "-1", function(obj, maxID){
                    BD2K.solr.add({"id":-1,"name":"maxID","source":"hidden",description:finalMax}, function(obj){})
                }, [maxID[0]]);
            }
        }, [maxID - 1]);
    }
});


//var insert = JSON.parse(json);
//if(!insert.id)
//    insert.id  = Math.random().toString();
//insert.source = "User Submission";
//self.id = insert.id;
//
//BD2K.solr.delete("id", insert.id, function(obj){
//    BD2K.solr.add(insert, function(result){
//        self.onAdd();
//    })
//});