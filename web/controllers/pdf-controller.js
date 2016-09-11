var stripAnsi = require('strip-ansi');
var multer = require('multer');
var mkdirp = require('mkdirp');


var waitTime = 5000;


function Uploader() {
    var self = this;
    self.middleware = multer({
        storage: self._storage
    });
    self.upload = function(req, res) {
        self._upload(self, req, res);
    };
    self.delete_file = function(req, res) {
        self._delete_file(self, req, res);
    };
}



Uploader.prototype._upload = function(self, req, res) {

    var user = req.user.email;
    // pass the req.user object to the shell script in order to make specific folders and delete specific folders
    if (req.file) {
        var exec = require('child_process').exec;
        var puts = "";
        const execFile = require('child_process').execFile;
        // make this path relative too.

        const child = execFile('bash', ['./slots-extraction/scripts/getting_started.sh', user], (error, stdout, stderr) => {
            if(error){
                console.log(error, stdout, stderr);
                console.log("The pdf extractor was unable to run, no file in request object");
            }
            var a = JSON.stringify(stripAnsi(stdout), null, 3);
            return res.json(JSON.parse(a));

        });
    }
};

Uploader.prototype._delete_file = function(self, req, res) {
    var user = req.user.email;
    var exec = require('child_process').exec;
    const execFile = require('child_process').execFile;
    const child = execFile('bash', ['./slots-extraction/scripts/delete_file.sh', user], (error, stdout, stderr) => {
        if (error) {}
        console.log(stdout);
    });

}

Uploader.prototype._storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var user = req.user.email;
        var path = './slots-extraction/data/' + user;
        mkdirp(path, cb, function(e) { // make this mkdirp - right now it runs if folders exist
            cb(null, path); // path earlier
        });
    }
});

module.exports = new Uploader();
