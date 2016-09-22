var util = require('../utility/toolUtils');
var BD2K = require('../utility/bd2k.js');

function Tool_Editor() {
    var self = this;

    self.edit = function(req, res) {
        self._edit(self, req, res);
    };

}

function extract_id(originalUrl) {
    //Replace all leading non digits with nothing
    return originalUrl.replace( /^\D+/g, '');
}

Tool_Editor.prototype._edit = function (self, req, res) {
    var id = extract_id(req.originalUrl);
    BD2K.solr.search({id: id}, function (r) {
        var result = r.response.docs[0];
        if (result == undefined){
            return res.render('tool/message.ejs', {message: "Document does not exist"});
        }
        var owners = result['owners'];
        if (owners == undefined || owners.indexOf(req.user.email) <= -1){
            return res.render('tool/message.ejs', {message: "Permission denied"});
        }
        console.log(result);
        var data = util.extract2form(result);
        return res.render('tool/form.ejs', {title: "Edit",
            heading: "Edit Resource #",
            user: req.user,
            loggedIn : req.isAuthenticated(),
            editURL: "",
            submitFunc: "onEditSubmit()",
            init: "vm.initEdit2("+JSON.stringify(data)+")"
        });
    })
};

module.exports = new Tool_Editor();
