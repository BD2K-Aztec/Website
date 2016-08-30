//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  ReviewController
//

var ReviewTool = require('../models/review-tool.js');
var SavedTool = require('../models/mongo/savedTool.js');
var Feedback = require('../models/feedback.js');
var User = require('../models/mysql/user_az.js');
var Tool = require('../models/mysql/tool.js');

function ReviewController() {
    var self = this;

    this.getTool = function(req, res) { self._getTool(self, req, res); };
    this.showForm = function(req, res) {self._showForm(self, req, res); };
    this.create = function(req, res) {self._create(self, req, res); };
    this.update = function(req, res) {self._update(self, req, res); };
    this.getEditForm = function(req, res) {self._getEditForm(self, req, res)};
    this.allSaved = function(req, res) {self._allSaved(self, req, res); };
    this.getFeedback = function(req, res) {self._getFeedback(self, req, res); };
    this.save = function(req, res) {self._save(self, req, res); };
    this.savedJson = function(req, res) {self._savedJson(self, req, res); };
    this.getSaved = function(req, res) {self._getSaved(self, req, res); };
    this.userTools = function(req, res) {self._userTools(self, req, res); };
    this.portal = function(req, res) {self._portal(self, req, res); };
    this.feedback = function(req, res) {self._feedback(self, req, res); };
    this.formApi = function(req, res) {self._formApi(self, req, res); }
}

//--- getTool -----------------------------------------------------------------------
ReviewController.prototype._getTool = function (self, req, res) {

  if(req.params['id']!=undefined && !isNaN(req.params['id'])){
    var tool = new ReviewTool();
    return tool.json(req.params['id'], function(t){
      return res.json(t);
    });
  }else{
    var response = {
      status  : 'error',
      error   : 'Invalid input'
    };
    return res.json(response);
  }
};

//--- showForm -----------------------------------------------------------------------
ReviewController.prototype._showForm = function (self, req, res) {

  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = "FIRST_NAME";

  console.log(req.user);
  return res.render('tool/form.ejs', {title:"Register", heading:"Register New Resource", user: req.user, loggedIn : req.isAuthenticated(), editURL: "", submitFunc: "onNewSubmit()", tool: null, init: ""});

};

//--- create -----------------------------------------------------------------------
ReviewController.prototype._create = function (self, req, res) {
  var tool = new ReviewTool();
  return tool.add(req.user, req.body, function(t){
    return res.send(t);
  });

};

//--- update -----------------------------------------------------------------------
ReviewController.prototype._update = function (self, req, res) {
  var tool = new ReviewTool();
  return tool.update(req.params.id, req.body, function(t){
    return res.send(t);
  });

};

//--- getEditForm -----------------------------------------------------------------------
ReviewController.prototype._getEditForm = function (self, req, res) {
  var id = req.params.id;
  id = parseInt(id);
  if(!req.isAuthenticated()){
    return res.json({status:'error', message: 'Not logged in'});
  }
  var userID = req.user.email;
  console.log("User %s is accessing resource #%s", userID, id);
  Tool.forge()
    .where({AZID: id})
    .fetch({withRelated: ['users_az']})
    .then(function(tool){
      console.log(1);
      var toolJson = tool.toJSON();
      var access = false;
      toolJson['users_az'].forEach(function(user){
        console.log(user);
        if(userID==user.USER){
          access = true;
        }
      });
      if(access==false){
        return res.json({status:'error', message:'You do not have permission to edit this tool.'});
      }
      else{
        var loginName = 'Login';
        return res.render('tool/form.ejs', {title: "Edit",
          heading: "Edit Resource #"+id,
          user: req.user,
          loggedIn : req.isAuthenticated(),
          editURL: "",
          submitFunc: "onEditSubmit()",
          init: "data-ng-init=vm.initEdit("+id+")"});
      }
    })
    .catch(function(err){
      return res.json({
        status: 'error',
        message: 'Invalid AZID'
      });
    })

};

//--- save -----------------------------------------------------------------------
ReviewController.prototype._save = function (self, req, res) {
  var tool = new ReviewTool();
  return tool.save(req.user, req.body, function(t){
    return res.send(t);
  });

};

//--- getSaved -----------------------------------------------------------------------
ReviewController.prototype._getSaved = function (self, req, res) {
  var id = req.params.id;

  if(req.isAuthenticated() && req.user!=undefined){
    SavedTool.findOne({user: req.user.email, '_id' : id}, function(err, tool){
      if(err || tool==null){
        return res.json({status: 'error', message: 'Resource not found'});
      }else{
        return res.render('tool/form.ejs', {title: "Register",
          heading: "Register New Resource",
          user: req.user,
          loggedIn : true,
          editURL: "",
          submitFunc: "onNewSubmit()",
          init: "data-ng-init=vm.initSaved(\'"+id+"\')"});
        }
      });
  }
  else{
    return res.send({status: 'error', message: 'Not logged in'});
  }

};

//--- savedJson -----------------------------------------------------------------------
ReviewController.prototype._savedJson = function (self, req, res) {
  if(!req.isAuthenticated()){
    var response = {
      status  : 'error',
      error   : 'Not logged in'
    };
    return res.json(response);
  }
  else if(req.params['id']!=undefined && req.params['id'].length==24){
    var ObjectId = (require('mongoose').Types.ObjectId);
    var id = new ObjectId(req.params['id']);
    var user = req.user.email;
    SavedTool.findOne({user: user, '_id' : id}, function(err, tool){
      if (err || tool == null){
        var response = {
          status  : 'error',
          error   : 'Tool not found'
        };
        return res.json(response);
      }else{
        var sendTool = tool.toJSON();
        sendTool['tool']['savedID'] = id;
        return res.json(sendTool['tool']);
      }
    });
  }
  else{
    var response = {
      status  : 'error',
      error   : 'Invalid input'
    };
    return res.json(response);
  }

};

//--- save -----------------------------------------------------------------------
ReviewController.prototype._allSaved = function (self, req, res) {
  if(!req.isAuthenticated()){
    var response = {
      status  : 'error',
      message   : 'Not logged in'
    };
    return res.json(response);
  }
  else{
    var user = req.user.email;
    SavedTool.find({user : user}, function(err, tools){
      if (err || tools == null){
        var response = {
          status  : 'error',
          message   : 'Tools not found'
        };
        return res.json(response);
      }
      else{
        var sendTools = [];
        tools.forEach(function(tool){
          var toolJson = tool.toJSON();
          toolJson['tool']['basic']['id'] = toolJson['_id'];
          toolJson['tool']['basic']['date'] = toolJson['date'];
          sendTools.push(toolJson['tool']['basic']);
        });
        return res.json(sendTools);
      }
    });
  }

};

//--- getFeedback -----------------------------------------------------------------------
ReviewController.prototype._getFeedback = function (self, req, res) {
  if(!req.isAuthenticated()){
    var response = {
      status  : 'error',
      message   : 'Not logged in'
    };
    return res.json(response);
  }
  else{
    var user = req.user.email;
    Feedback.find({}, function(err, feedbacks){
      if (err || feedbacks == null){
        var response = {
          status  : 'error',
          message   : 'Feedbacks not found'
        };
        return res.json(response);
      }
      else{
        var sendFeedbacks = [];
        feedbacks.forEach(function(feedback){
          var feedbackJson = feedback.toJSON();
          feedbackJson['id'] = feedbackJson['_id'];
          sendFeedbacks.push(feedbackJson);
        });
        return res.json(sendFeedbacks);
      }
    });
  }

};

//--- userTools -----------------------------------------------------------------------
ReviewController.prototype._userTools = function(self, req, res){
  if(!req.isAuthenticated){
    var response = {
      status  : 'error',
      message   : 'Not logged in'
    };
    return res.json(response);
  }else{
    User.forge()
      .query({where: {USER: req.user.email}})
      .fetchAll({withRelated: ['tool']})
      .then(function(user){
        if(user==null){
          var response = {
            status  : 'error',
            message   : 'No user found'
          };
          return res.json(response);
        }
        else{
          var response = [];
          user.forEach(function(obj){
            var tool = obj.toJSON();
            console.log(obj, tool);
            response.push(tool['tool']);
          });
          res.json(response);
        }
      })
      .catch(function(err){
        console.log(err);
        var response = {
          status  : 'error',
          message   : 'Query error'
        };
        return res.json(response);
      })
    }
};

//--- portal -----------------------------------------------------------------------
ReviewController.prototype._portal = function (self, req, res) {
  res.render('home/portal', {
      loggedIn : req.loggedIn,
      user : req.user, // get the user out of session and pass to template
      message: req.flash('profileMessage')});

};

//--- portal -----------------------------------------------------------------------
ReviewController.prototype._feedback = function (self, req, res) {
  res.render('home/feedback', {
    loggedIn : req.loggedIn,
    user : req.user, // get the user out of session and pass to template
    message: req.flash('profileMessage')});

};
//--- formApi -----------------------------------------------------------------------
ReviewController.prototype._formApi = function(self, req, res){
  if(req.params['id']!=undefined && !isNaN(req.params['id'])){
      var tool = new ReviewTool();
      return tool.show(req.params['id'], function(t){
        res.send(t);
      });
    }else{
      var response = {
        status  : 'error',
        error   : 'Invalid input'
      };
      return res.send(response);
    }
}
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new ReviewController();
