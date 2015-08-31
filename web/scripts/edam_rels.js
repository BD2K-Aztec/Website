var libxmljs = require("libxmljs");
var fs = require('fs');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var xml2js = require('xml2js');
var path = require('path');
var BD2K = require("../utility/bd2k.js");

var con = {};

con.readFile = function(path) {

    var onFileRead = con.onFileRead;

    try {
        fs.readFile(path, 'utf8', onFileRead);
    }
    catch (e) {
        console.log(e);
    }
};

con.onFileRead = function(err, words) {
    var doc = new dom().parseFromString(words);

    var parser = new xml2js.Parser();
    parser.parseString(words, function (err, result) {
        console.dir(result);
        var subClasses = result.Ontology.SubClassOf;

        var toIns = [];
        for (var i=0; i<subClasses.length; i++){
            var subClass = subClasses[i];

            if (!( BD2K.has(subClass["Class"]) && BD2K.has(subClass["Class"][0]) && BD2K.has(subClass["Class"][0]["$"]) )) { continue; }
            if (!( BD2K.has(subClass["Class"][1]) && BD2K.has(subClass["Class"][1]["$"]) )) { continue; }

            var first = subClass["Class"][0]["$"];
            var second = subClass["Class"][1]["$"];
            if (!BD2K.has(first.IRI)) { continue;}
            if (!BD2K.has(second.IRI)) { continue;}
            var parent = second.IRI.replace(/^\//, '');
            var child = first.IRI.replace(/^\//, '');
            var edge = {};
            edge.parent = parent;
            edge.child = child;
            toIns.push(edge);
        }

        var insNeo = function(i) {
            if (i >= toIns.length) { return; }

            if (i % 50 == 0) {
                console.log(((i / toIns.length) * 100).toString() + "%");
            }

            var edge = toIns[i];
            var cypher = [
                "MERGE (p:Entity { IRI: '" + edge.parent   + "' })",
                "MERGE (c:Entity { IRI: '" + edge.child   + "' })",
                "MERGE (p)-[h:HAS_CHILD]->(c)",
                "RETURN p, c, h"
            ].join('\n');

            BD2K.neo4j(cypher, function() {
                insNeo(i+1);
            });
        };

        insNeo(0);

        console.log('Done');
    });

    //var nodes = xpath.select("//SubClassOf", doc);



    return;

    var nodes = xpath.select("//body//p", doc);
    var abstractNodes = xpath.select("//abstract//p", doc);

    if (typeof(abstractNodes[0]) == "undefined"){
        if (idx == files.length - 1) {
            container.haveFilesToKeep(container.filesToKeep);
        }
        else {
            container.haveHashAndFiles(files, idx+1);
        }
        return;
    }

    var abstractNodesStr = abstractNodes[0].toString();
    var abstract = libxmljs.parseXml(abstractNodesStr).root().text();

    abstract = abstract.replace(/\r?\n/g, ' ');

    var lines = [];

    for (var i=0; i<nodes.length; i++){
        var xmlDoc = libxmljs.parseXml(nodes[i].toString());
        var raw = xmlDoc.root().text();
        lines.push(raw);
    }

    var docStr = lines.join(' ');
    docStr = docStr.replace(/\r?\n/g, ' ');

    var abstractTokens = abstract.split(/\s+/g);
    var keep = false;
    for (var i=0; i<abstractTokens.length; i++){
        var token = abstractTokens[i];
        if (token in dbHash) {
            keep = true;
            break;
        }
    }

    if (keep){
        var obj = {};
        obj.file = file;
        container.filesToKeep.push(obj);
    }

    if (idx == files.length - 1) {
        container.haveFilesToKeep(container.filesToKeep);
    }
    else {
        container.haveHashAndFiles(files, idx+1);
    }
};

con.readFile(path.join(__dirname, './resources/edam.xml'));