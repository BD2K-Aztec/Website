var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var config = require('../config/app.json');
var crypto = require('crypto');
var neo4j = require('neo4j');
var querystring = require('querystring');
var solr = require('solr-client');
var mongo = require('mongodb').MongoClient;

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  BD2K
//
function BD2K(){}

BD2K.removeDuplicates = function(arr){
    var a = [];
    for ( i = 0; i < arr.length; i++ ) {
        var current = arr[i];
        if (a.indexOf(current) < 0) a.push(current);
    }

    return a;
};

BD2K.extend = function(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

//--- encrypt ------------------------------------------------------------------------------
BD2K.encrypt = function (message) {
    var algorithm = 'aes256';
    var key = 'password';

    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
};

//--- decrypt ------------------------------------------------------------------------------
BD2K.decrypt = function (encrypted) {
    var algorithm = 'aes256';
    var key = 'password';
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
};

BD2K.decrypt = function (key, encrypted) {
    var algorithm = 'aes256';
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
};

//--- query ------------------------------------------------------------------------------
BD2K.mysql = function (sql, handler, params, passOptions) {

    var options = {};
    options.host = config.mysqlHost;
    options.user = BD2K.decrypt(config.mysqlUser);
    options.password = BD2K.decrypt(config.mysqlPassword);
    options.database = "BD2K";
    options.multipleStatements = true;

    var connection = mysql.createConnection(options);
    connection.connect();

    var container = {};

    //---- onTransaction --------------------
    container.onTransaction = function(err) {
        var onQuery = container.onQuery;

        if (err) { throw err; }

        if (BD2K.has(params)) {
            params = BD2K.array(params);
            return connection.query(sql, params, onQuery);
        }
        else {
            return connection.query(sql, onQuery);
        }
    };

    //---- onQuery --------------------
    container.onQuery = function(err, rows, fields){
        var onCommit = container.onCommit;
        var onRollback = container.onRollback;

        if (err) {
            container.err = err;
            return connection.rollback(onRollback);
        }
        container.rows = rows;
        connection.commit(onCommit);
    };

    //---- onCommit --------------------
    container.onCommit = function(err){
        var onRollback = container.onRollback;
        var rows = container.rows;
        if (err) {
            container.err = err;
            return connection.rollback(onRollback);
        }
        handler(rows);
    };

    //---- onRollback --------------------
    container.onRollback = function() {
        var err = container.err;
        throw err;
    };

    connection.beginTransaction(container.onTransaction);
};

//--- neo4j ------------------------------------------------------------------------------
BD2K.neo4j = function (cypher, handler){

    var url = config.neo4jUrl;
    var db = new neo4j.GraphDatabase(url);

    var onCypher = function (err, results) {
        if (err) { console.log("\nERROR:\n"); console.log(err); console.log("\nCYPHER:\n"); console.log(cypher); console.log("-----------------------------------------------"); handler(results); }
        else { handler(results); }
    };

    if (BD2K.has(db.cypher)) {
        db.cypher(cypher, onCypher);
    }
    else {
        db.query(cypher, onCypher);
    }
};

//----- json -----------------------------------------------------------------
BD2K.json = function (res, data) {

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    if (typeof data === "string") {
        res.write(data);
    }
    else {
        res.write(JSON.stringify(data));
    }
    res.end();
};

//----- public -----------------------------------------------------------------
BD2K.public = function (file, callback) {
    var public = path.join(__dirname, '../public/', file);
    fs.readFile(public, "utf-8", function (err, data) { callback(data); });
};

//----- clone -----------------------------------------------------------------
BD2K.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

//----- isFunction -----------------------------------------------------------------
BD2K.isFunction = function (obj) {
    return BD2K.has(obj) && typeof obj === "function";
};

//----- isArray -----------------------------------------------------------------
BD2K.isArray = function (obj) {
    return BD2K.has(obj) && Object.prototype.toString.call(obj) === '[object Array]';
};

//----- array -----------------------------------------------------------------
BD2K.array = function (obj) {
    if(!(Object.prototype.toString.call(obj) === '[object Array]')) { return [obj]; }
    return obj;
};

//----- has -----------------------------------------------------------------
BD2K.has = function (properties) {

    if(!(Object.prototype.toString.call(properties) === '[object Array]')) {
        return typeof  properties != "undefined";
    }

    for (var i=0; i<properties.length; i++){
        if (typeof properties[i] == "undefined"){ return false; }
    }

    return true;
};

//----- wrap -----------------------------------------------------------------
BD2K.wrap = function (data) {

    var obj = {};
    obj.data = data;

    return obj;
};

//----- html -----------------------------------------------------------------
BD2K.html = function(res, html) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(html);
    res.end();
};

//----------------------------------------------------------------------
//----- solr -----------------------------------------------------------------
//----------------------------------------------------------------------
BD2K.solr = {};

//--- search ------------------------------------------------------------------------------
BD2K.solr.search = function(fields, handler, handlerOptions){
    var options = {};
    options.core = "BD2K";
    options.host = config.solrHost;
    options.port = config.solrPort;

    console.log("host: " + options.host);
    console.log("port: " + options.port);
    var client = solr.createClient(options);
    console.log("fields: " + JSON.stringify(fields));
    for(var key in fields){

        var lengthField = fields[key].length;
        for(var i = 0; i < lengthField; i++){
            var val = fields[key][i]
            var loc = val.toLowerCase().indexOf("deoxyribonucleic acid");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "DNA" + val.substring(loc+21, val.length));
            }

            loc = val.toLowerCase().indexOf("sequencing");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "seq" + val.substring(loc+10, val.length));
            }

            loc = val.toLowerCase().indexOf("sequence");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "seq" + val.substring(loc+8, val.length));
            }

            loc = val.toLowerCase().indexOf("seq");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "sequence" + val.substring(loc+3, val.length));
                fields[key].push(val.substring(0, loc) + "sequencing" + val.substring(loc+3, val.length));
            }

            loc = val.toLowerCase().indexOf("ribonucleic acid");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "RNA" + val.substring(loc+16, val.length));
            }

            loc = val.toLowerCase().indexOf("snp");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "variant" + val.substring(loc+3, val.length));
            }

            loc = val.toLowerCase().indexOf("variant");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "snp" + val.substring(loc+7, val.length));
            }

            loc = val.toLowerCase().indexOf("ribonucleic acid");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "RNA" + val.substring(loc+16, val.length));
            }

            loc = val.toLowerCase().indexOf("variant");
            if(loc > -1){
                fields[key].push(val.substring(0, loc) + "variants" + val.substring(loc+7, val.length));
            }
        }
    }

    var query = client.createQuery()
        .q(querystring.stringify(fields, " OR ", ":"))
        .edismax()
        //.qf()
        .mm("0%25")
        //.qop("OR")
        .start(0)
        .rows(10000000);
    client.search(query,function(err,obj){
        if(err){
            console.log("Search: " + err);
        }else{
            handler(obj, handlerOptions);
        }
    });
};

//--- delete ------------------------------------------------------------------------------
BD2K.solr.delete = function(field, value, handler, handlerOptions){
    var options = {};
    options.core = "BD2K";
    options.host = config.solrHost;
    options.port = config.solrPort;
    var client = solr.createClient(options);
    client.delete(field, value, function(err,obj){
        if(err){
            console.log("Delete: " + err);
        }else{
            client.commit(function(err,res){
                //if(err) console.log(err);
                //if(res) console.log(res);
            });
            handler(obj, handlerOptions);
        }
    });
};

//--- search_suggest ------------------------------------------------------------------------------
BD2K.solr.search_suggest = function(fields, handler) {
    var options = {};
    options.core = "BD2K";
    options.host = config.solrHost;
    options.port = config.solrPort;
    var client = solr.createClient(options);
    //var query = client.createQuery()
    //    .q(query_str)
    //    //.qf()
    //    //.edismax()
    //    //.mm("0%100")
    //    //.qop("OR")
    //    .start(0)
    //    .rows(30);
    //client.search(query,function(err,obj){
    //    if(err){
    //        console.log("Search: " + err);
    //    }else{
    //        handler(obj);
    //    }
    //});

    var query = "q="+fields.name;

    if(fields.searchType == "tags") {
        query_str = "q=suggestTag:\""+fields.name + "\""  + "+OR+" + "suggestTagPrefix:\""+fields.name+"\"";

        client.get('suggestResource', query_str, function (err, obj) {
            if (err) {
                console.log("Search: " + err);
            } else {
                handler(obj);
            }
        });
    }
    if(fields.searchType != "tags")
    {
        query_str = "q=suggestName:\""+fields.name + "\""  + "+OR+" + "suggestNamePrefix:\""+fields.name+"\"";
        client.get('suggestResource', query_str, function (err, obj) {
            if (err) {
                console.log("Search: " + err);
            } else {
                console.log("Search: ");
                handler(obj);
            }
        });
    }
};


//--- add ------------------------------------------------------------------------------
BD2K.solr.add = function(doc, handler, handlerOptions){
    var options = {};
    options.core = "BD2K";
    options.host = config.solrHost;
    options.port = config.solrPort;
    var client = solr.createClient(options);
    client.add(doc,function(err,obj){
        if(err){
            console.log("Add: " + err);
        }else{
            client.commit(function(err,res){
                //if(err) console.log(err);
                //if(res) console.log(res);
            });
            handler(obj, handlerOptions);
        }
    });
};

//----------------------------------------------------------------------
//----- mongo -----------------------------------------------------------------
//----------------------------------------------------------------------
BD2K.mongo = {};

//----- search -----------------------------------------------------------------
BD2K.mongo.search = function(collectionStr, search, callback){

    var host = config.mongoHost;
    var port = config.mongoPort;
    var username = BD2K.decrypt('user', config.mongoUsername);
    var password = BD2K.decrypt('password', config.mongoPassword);
    var url = 'mongodb://'+username+':'+password+'@'+ host + ':' + port  + '/BD2K';

    var container = {};

    //---- onConnect --------------------
    container.onConnect = function (err, db) {
        if(err)
            console.log(err);
        else{
            var search = container.search;
            search(db);
        }

    };

    //---- search --------------------
    container.search = function(db) {
        var collection = db.collection(collectionStr);
        var onFind = container.onFind;
        container.db = db;
        collection.find(search).toArray(onFind);
    };

    //---- onFind --------------------
    container.onFind = function(err, result) {
        var onFindComplete = container.onFindComplete;
        onFindComplete(result);
    };

    //---- onFindComplete --------------------
    container.onFindComplete = function(result) {
        var db = container.db;
        db.close();
        callback(result);
    };

    mongo.connect(url, container.onConnect);
};

//----- insert -----------------------------------------------------------------
BD2K.mongo.insert = function(collectionStr, data, callback){

    data = BD2K.array(data);

    var host = config.mongoHost;
    var port = config.mongoPort;
    var username = BD2K.decrypt('user', config.mongoUsername);
    var password = BD2K.decrypt('password', config.mongoPassword);
    var url = 'mongodb://'+username+':'+password+'@'+ host + ':' + port  + '/BD2K';


    var container = {};

    //---- onConnect --------------------
    container.onConnect = function (err, db) {
        if(err)
            console.log(err);
        else{
            var insert = container.insert;
            insert(db);
        }
    };

    //---- insert --------------------
    container.insert = function(db) {
        var collection = db.collection(collectionStr);
        var onInsertMany = container.onInsertMany;
        container.db = db;
        collection.insertMany(data, onInsertMany);
    };

    //---- onInsertMany --------------------
    container.onInsertMany = function(err, result) {
        var onInsertComplete = container.onInsertComplete;
        onInsertComplete(result);
    };

    //---- onInsertComplete --------------------
    container.onInsertComplete = function(result) {
        var db = container.db;
        db.close();
        if (BD2K.isFunction(callback)) {
            callback(result);
        }
    };

    mongo.connect(url, container.onConnect);
};

//----- upsert -----------------------------------------------------------------
BD2K.mongo.upsert = function(collectionStr, search, document, callback){

    var host = config.mongoHost;
    var port = config.mongoPort;
    var username = BD2K.decrypt('user', config.mongoUsername);
    var password = BD2K.decrypt('password', config.mongoPassword);
    var url = 'mongodb://'+username+':'+password+'@'+ host + ':' + port  + '/BD2K';

    var container = {};

    //---- onConnect --------------------
    container.onConnect = function (err, db) {
        if(err)
            console.log("mongo" + err);
        else{
            var upsert = container.upsert;
            upsert(db);
        }
    };

    //---- upsert --------------------
    container.upsert = function(db) {
        var collection = db.collection(collectionStr);
        var onUpsert = container.onUpsert;
        container.db = db;
        var options = {};
        options.upsert = true;
        collection.updateOne(search, document, options, onUpsert);
    };

    //---- onUpsert --------------------
    container.onUpsert = function(err, result) {
        var onUpsertComplete = container.onUpsertComplete;
        onUpsertComplete(result);
    };

    //---- onUpsertComplete --------------------
    container.onUpsertComplete = function(result) {
        var db = container.db;
        db.close();
        if (BD2K.isFunction(callback)) {
            callback(result);
        }
    };

    mongo.connect(url, container.onConnect);
};

//----- update -----------------------------------------------------------------
BD2K.mongo.update = function(collectionStr, search, document, callback){

    var host = config.mongoHost;
    var port = config.mongoPort;
    var username = BD2K.decrypt('user', config.mongoUsername);
    var password = BD2K.decrypt('password', config.mongoPassword);
    var url = 'mongodb://'+username+':'+password+'@'+ host + ':' + port  + '/BD2K';


    var container = {};

    //---- onConnect --------------------
    container.onConnect = function (err, db) {
        if(err)
            console.log(err);
        else{
            var update = container.update;
            update(db);
        }
    };

    //---- update --------------------
    container.update = function(db) {
        var collection = db.collection(collectionStr);
        var onUpdate = container.onUpdate;
        container.db = db;
        collection.updateOne(search, document, null, onUpdate);
    };

    //---- onUpdate --------------------
    container.onUpdate = function(err, result) {
        var onUpdateComplete = container.onUpdateComplete;
        onUpdateComplete(result);
    };

    //---- onUpdateComplete --------------------
    container.onUpdateComplete = function(result) {
        var db = container.db;
        db.close();
        if (BD2K.isFunction(callback)) {
            callback(result);
        }
    };

    mongo.connect(url, container.onConnect);
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = BD2K;
