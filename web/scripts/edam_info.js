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

        var anAsserts = result.Ontology.AnnotationAssertion;

        var toIns = {};
        for (var i=0; i<anAsserts.length; i++) {
            var anAssert = anAsserts[i];
            if (!( BD2K.has(anAssert["AnnotationProperty"]) && BD2K.has(anAssert["IRI"]) && BD2K.has(anAssert["Literal"]) )) { continue; }
            if (!( BD2K.isArray(anAssert["AnnotationProperty"]) && BD2K.isArray(anAssert["IRI"]) && BD2K.isArray(anAssert["Literal"]) )) { continue; }
            if (!( anAssert["AnnotationProperty"].length > 0 && anAssert["IRI"].length > 0 && anAssert["Literal"].length > 0 )) { continue; }
            if (!( BD2K.has(anAssert["AnnotationProperty"][0]["$"]) && BD2K.has(anAssert["Literal"][0]["_"]) )) { continue; }

            var type = anAssert["AnnotationProperty"][0]["$"].abbreviatedIRI;

            if (!BD2K.has(type)) { continue; }
            if (!( type == "oboInOwl:hasDefinition" || type == "ns20477:label" || type == "oboInOwl:hasExactSynonym" )) { continue; }

            var val = anAssert["Literal"][0]["_"];
            var iri = anAssert["IRI"][0].replace(/^\//, '');

            if (!(iri in toIns)) { toIns[iri] = {}; toIns[iri].synonyms = []; }

            if (type == "oboInOwl:hasDefinition") {
                toIns[iri].definition = val;
            }
            if (type == "ns20477:label") {
                toIns[iri].label = val;
            }
            if (type == "oboInOwl:hasExactSynonym") {
                toIns[iri].synonyms.push(val);
            }
        }

        var hashArr = [];

        for (var key in toIns) {
            var keyVal = {};
            keyVal.key = key;
            keyVal.val = toIns[key];
            hashArr.push(keyVal);
        }

        var insNeo = function(i) {
            if (i >= hashArr.length) { return; }

            if (i % 50 == 0) {
                console.log(((i / hashArr.length) * 100).toString() + "%");
            }

            var iri = hashArr[i].key;
            var vals = hashArr[i].val;

            var definition = vals.definition;
            var label = vals.label;
            var synonyms = vals.synonyms;

            var setLine = 'SET e.label = "' + label + '", e.definition="' + definition + '"';
            setLine = synonyms.length > 0 ? setLine + ', e.synonyms=' + JSON.stringify(synonyms) : setLine;
            var matchLine = "ON MATCH " + setLine;
            var creatLine = "ON CREATE " + setLine;
            var cypher = [
                "MERGE (e:Entity { IRI: '" + iri   + "' })",
                matchLine,
                creatLine,
                "RETURN e"
            ].join('\n');

            BD2K.neo4j(cypher, function() {
                insNeo(i+1);
            });
        };

        insNeo(0);

        console.log('Done');
    });
};

con.readFile(path.join(__dirname, './resources/edam.xml'));
