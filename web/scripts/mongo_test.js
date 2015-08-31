var BD2K = require('./../utility/bd2k.js');
var mongo = BD2K.mongo;

var test = {};
test.a = 6;
test.b = 6;

var search = {};
search.a = 6;

mongo.upsert("resource_stats", search, test, function(result) {
    //console.log(result);
    mongo.search("resource_stats", search, function(result2) {
        console.log(result2);
    });
});


