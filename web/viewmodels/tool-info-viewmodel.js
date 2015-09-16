var Event = require('../utility/event.js');
var Tool = require('../models/tool.js');
var request = require('request');
var BD2K = require('../utility/bd2k.js');
var graphviz = require('graphviz');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ToolInfoViewModel
//
function ToolInfoViewModel(request) {

    var self = this;
    this.load = function(callback) { self._load(self, callback); };
    this.onLoad = function() { self._onLoad(self); };

    var crud = new Event();

    this.request = request;
    this._crud = crud;
    this.crud = crud.register;
}

//--- load ------------------------------------------------------------------------------
ToolInfoViewModel.prototype._load = function (self, callback) {

    self.crud(callback);

    var cont = {};

    cont.loadSvg = function() {
        var dot = [
            'digraph G {',
            'rankdir=LR;',
            'bowtie2 -> tophat2 [color = blue];',
            'tophat2 -> cufflinks [color = blue];',
            'bowtie2  [shape=hexagon,style=filled,fillcolor="#8FA3D8",height=0.75];',
            'tophat2 [shape=hexagon,style=filled,fillcolor="#A3CC90",height=0.75];',
            'cufflinks [shape=hexagon,style=filled,fillcolor="#8FA3D8",height=0.75];',
            '}'
        ].join('\n');
        var g = graphviz.digraph("G");
        //g.outputStr(dot, cont.onSvgLoaded);
        cont.onSvgLoaded("");
    };

    cont.onSvgLoaded = function(html) {
        self.svg = html;
        cont.run();
    };

    cont.run = function() {

        BD2K.solr.search({"id": self.request}, function (obj) {
            self.resource = obj.response.docs[0];
            self.onLoad();
        });

        request({
            url: 'http://neo4j:scailab@localhost:7474/db/data/transaction/commit',
            json: {
                "statements": [{
                    "statement": "MATCH (n:resource { name: 'This Tool' })-[:Downstream]-(neighbors) RETURN n,neighbors",
                    "resultDataContents": ["row", "graph"]
                }]
            }, //Query string data
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; charset=UTF-8'
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                self.neo4j = [];
                self.onLoad();
            } else {
                console.log(response.statusCode, body);
                self.neo4j = body.results[0];
                self.onLoad();
            }
        });
    };

    cont.loadSvg();
};

//--- onLoad ------------------------------------------------------------------------------
ToolInfoViewModel.prototype._onLoad = function (self) {
    { if(BD2K.has([self.resource, self.neo4j])) self._crud.fire(self); }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = ToolInfoViewModel;