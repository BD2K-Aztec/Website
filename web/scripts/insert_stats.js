var BD2K = require('../utility/bd2k.js');
var Resource = require('../models/resource.js');

var html = [
    '<html><body>Done</body></html>'
].join('\n');

var resource = new Resource();
resource.update(function(i){console.log("Success")});