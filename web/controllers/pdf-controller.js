var fs = require('fs');
var busboy = require('connect-busboy');
var jsonfile = require('jsonfile');
var util = require('../utility/toolUtils');
var BD2K = require('../utility/bd2k.js');
var solr = require('solr-client');



var waitTime = 5000;


function Uploader() {
    var self = this;

    self.upload = function(req, res) {
        self._upload(self, req, res);
    };
    self.delete_file = function(req, res) {
        self._delete_file(self, req, res);
    };
    self.extract = function (req, res) {
        self._extract(self, req, res);
    };
    self.push = function (req, res) {
        self._push(self, req, res);
    }

}



/**
 * Upload pdf file to user's directory, extract data and show it for editing.
 * @param self
 * @param req
 * @param res
 * @private
 */
Uploader.prototype._upload = function(self, req, res) {
    var fstream;
    var user = req.user.email;
    var dir = '../slots-extraction/data/' + user + '/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    var pdf_path = '../slots-extraction/data/' + user + '/';
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        pdf_path += filename;
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(pdf_path);
        var doi;
        req.busboy.on('field', function (fieldname, value, filename) {
            if(fieldname=='doi'){
              doi = value;
            }
        });
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Finished uploading");
            if(doi){
              return self._extract(self, req, doi, res);
            }

        });
    });

};

function delete_file(user, callback){
  var exec = require('child_process').exec;
  const execFile = require('child_process').execFile;
  const child = execFile('bash', ['../slots-extraction/scripts/delete_data.sh', user], (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        return callback(error);
      }

      return callback();
  });
}

Uploader.prototype._delete_file = function(self, req, res) {
    var user = req.user.email;
    return delete_file(user, res);

};

/**
 * Run the python extraction scripts through bash and render show extraction page
 * @param self
 * @param req
 * @param res
 * @private
 */
Uploader.prototype._extract = function (self, req, doi, res) {
    const execFile = require('child_process').execFile;
    var user = req.user.email;
    // make this path relative too.
    execFile('bash', ['../slots-extraction/scripts/getting_started.sh'
        , user, doi], (error, stdout, stderr) => {
        if(error){
            console.log(error, stdout, stderr);
            console.log("The pdf extractor was unable to run, no file in request object");
            return delete_file(user, function(msg){console.log(msg);});
        }
        else {
            //Extraction was successful, get data, push it to Solr and show it to user for editing
            var file = '../slots-extraction/data/' + user + '/' + 'slotExtracts/slot_extracts.json';
            jsonfile.readFile(file, function(err, obj) {
                if(err){
                    console.log(err);
                    console.log("Json loading of slot_extracts.json failed");
                    delete_file(user, function(msg){console.log(msg);});
                }
                else {
                    console.log("Pushing to Solr");
                    require('child_process').execFileSync('bash', ['../slots-extraction/scripts/push_solr.sh', file, user]);
                    delete_file(user, function(msg){console.log(msg);});
                    var formObj = util.extract2form(obj);
                    console.log("Form object is " + JSON.stringify(formObj));
                    return res.render('tool/form.ejs', {title: "Edit",
                      heading: "Edit Resource #",
                      user: req.user,
                      loggedIn : req.isAuthenticated(),
                      editURL: "",
                      submitFunc: "onEditSubmit()",
                      init: "vm.initEdit2("+JSON.stringify(formObj)+")"
                    });
                }
            })
        }
    });
};

/**
 * Push user edited input to Solr running on port 8983 and delete all extraction and pdf files
 * This function updates the already existing Solr document
 * @param self
 * @param req
 * @param res
 * @private
 */
Uploader.prototype._push = function (self, req, res) {
    BD2K.solr.search({publicationDOI: req.body.data.publicationDOI}, function (r) {
        var result = r.response.docs[0];
        req.body.data['id'] = result['id'];
        var data = JSON.stringify(req.body.data);
        console.log("Data is " + data);
        var PythonShell = require('python-shell');

        var options = {
            mode: 'text',
            scriptPath: '../slots-extraction/scripts',
            args: [data]
        };

        PythonShell.run('updateMetadata.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            //Show user some success message and send them back to homepage etc..
            
        });
        
    });

};

module.exports = new Uploader();
