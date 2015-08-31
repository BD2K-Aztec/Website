var Event = require('../../../utility/event.js');
var BD2K = require('../../../utility/bd2k.js');
var config = require('../../../config/app.json');
var solr = require('solr-client');


var options = {};
options.core = "BD2K";
options.host = config.solrHost;
options.port = config.solrPort;
var client = solr.createClient(options);

BD2K.solr.delete("source", "biocatalogue", function(obj){
    BD2K.solr.delete("source", "bioconductor", function(obj){
        BD2K.solr.delete("source", "biojs", function(obj){
            BD2K.solr.delete("source", "elixir", function(obj){
                BD2K.solr.delete("source", "galaxy", function(obj){
                    BD2K.solr.delete("id", "-1", function(obj){
                        BD2K.solr.add({"id":-1,"name":"maxID","source":"hidden",description:1}, function(obj){

                        });
                    });

                });
            });
        });
    });
});