var ToolInfoViewModel = require('../viewmodels/tool-info-viewmodel.js');
var CreateViewModel = require('../viewmodels/tool/create-viewmodel.js');
var EditViewModel = require('../viewmodels/tool/edit-viewmodel.js');
var BD2K = require('../utility/bd2k.js');
var Tool = require('../models/tool.js');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ToolController
//
function ToolController() {
    var self = this;

    this.show = function(req, res) { self._show(self, req, res) };
    this.create = function(req, res) { self._create(self, req, res) };
    this.filters = function(req, res) { self._filters(self, req, res); };
    this.edit = function(req, res) { self._edit(self, req, res); };
    this.idRoute = function(req, res) { self._idRoute(self, req, res); };
}

//--- filters ------------------------------------------------------------------
ToolController.prototype._filters = function (self, req, res){
    var filters = new Tool().filters();
    BD2K.json(res, filters);
};

//--- create ------------------------------------------------------------------
ToolController.prototype._create = function (self, req, res){
    var tool = new CreateViewModel(req.query.input);
    tool.load(function(i){
        if(req.isAuthenticated()) {
            i.email = req.user.email;
            res.render("tool/create", BD2K.extend(i, {
                loggedIn: req.loggedIn,
                user: req.user
            }));
        }
        else{
            i.email = "admin"; //change
            res.render("home/gologin"); //change
        }
    });
};

//--- edit ------------------------------------------------------------------
ToolController.prototype._edit = function (self, req, res){
    var tool = new EditViewModel(req.query.id);
    tool.load(function(i){
        if(req.isAuthenticated() && (i.preset.owners || req.user.isAdmin)){
            if(req.user.isAdmin || i.preset.owners.indexOf(req.user.email) > -1){
                i.email = req.user.email;
                res.render("tool/create", BD2K.extend(i, {
                    loggedIn: req.loggedIn,
                    user: req.user
                }));
            }
            else{
                res.render("tool/uneditable", i);
            }
        }
        else {
            res.render("tool/uneditable", i);
            //i.email = "admin"; //change
            //res.render("tool/create", BD2K.extend(i, {
            //    loggedIn: req.loggedIn,
            //    user: req.user
            //})); //change to failure page later
        }
    });
};

//--- show -----------------------------------------------------------------------
ToolController.prototype._show = function (self,req,res){
    var info = new ToolInfoViewModel(req.query.id);

    info.load(function(i){

        i.resource.editable = false;
        if(req.isAuthenticated() && (i.resource.owners || req.user.isAdmin)){
            if(req.user.isAdmin || i.resource.owners.indexOf(req.user.email) > -1){
                i.resource.editable = true;
            }
        }

        res.render("tool/show", BD2K.extend(i, {
            loggedIn: req.loggedIn,
            user: req.user
        }));
    });
};


//--- idRoute -----------------------------------------------------------------------
ToolController.prototype._idRoute = function (self,req,res){
    if(req.params.id){
        console.log(req.params.id);

        if(req.params.id.substring(0,2) != 'AZ') {
            res.redirect('/home/failure');
            return false;
        }
    
        if(req.params.id.substring(2).length != 7){
            var newId = ("0000000" + req.params.id.substring(2)).slice(-7);
            res.redirect('/AZ' + newId)
        }

        var id = parseInt(req.params.id.substring(2), 10);
        var info = new ToolInfoViewModel(id);

        info.load(function(i){

            i.resource.editable = false;
            if(req.isAuthenticated() && (i.resource.owners || req.user.isAdmin)){
                if(req.user.isAdmin || i.resource.owners.indexOf(req.user.email) > -1){
                    i.resource.editable = true;
                }
            }

            res.render("tool/show", BD2K.extend(i, {
                loggedIn: req.loggedIn,
                user: req.user
            }));
        });
    }
    else{
        res.redirect('/home/failure');
    }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new ToolController();
