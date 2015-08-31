var BD2K = require('../utility/bd2k.js');
var mongo = BD2K.mongo;
var fs = require('fs');

fs.readFile('scripts/resources/sources.json', function (err, data) {
    if (err) {
        return console.error(err);
    }
    var stat = {};
    stat.type = "sources";
    stat.data = JSON.parse(data.toString());

    var search = {};
    search.type = "sources";

    mongo.upsert("resource_stats", search, stat, function (err) {

        fs.readFile('scripts/resources/omics.json', function (err, data) {
            if (err) {
                return console.error(err);
            }
            var stat = {};
            stat.type = "omics";
            stat.data = JSON.parse(data.toString());

            var search = {};
            search.type = "omics";

            mongo.upsert("resource_stats", search, stat, function (err) {

            });
        });
    });
});