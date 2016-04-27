var Bookshelf = require('../config/bookshelf.js');
var async = require('async');
var Set = require('collections/set');

var Institution = require('../models/mysql/institution.js');
var InstAlias = require('../models/mysql/inst_alias.js');

var Language = require('../models/mysql/language.js');
var LangAlias = require('../models/mysql/lang_alias.js');

var Agency = require('../models/mysql/agency.js');
var AgencyAlias = require('../models/mysql/agency_alias.js');

var Tag = require('../models/mysql/tag.js');

var LIMIT_DEFAULT = 10;
var OFFSET_DEFAULT = 0;

function QueryController(model, alias) {
  var self = this;
  this.m_model = model;
  this.m_alias = alias;
  this.search = function(req, res) {
    self._search(self, req, res);
  };
}

QueryController.prototype._search = function(self, req, res) {
    var params = req.query;
    var limit = LIMIT_DEFAULT;
    var offset = OFFSET_DEFAULT;
    var offExist = false;
    var limExist = false;

    if(params['limit']!=undefined){
      limit = parseInt(params['limit']);
      limExist = true;
    }
    if(params['offset']!=undefined){
      offset = parseInt(params['offset']);
      offExist = true;
    }

    if(params['q']==undefined){
      return self._getAll(self, res, limit, offset, limExist, offExist);
    }else{
      var term = params['q'];
      if(self.m_alias!=undefined || self.m_alias!=null)
        return self._queryAlias(self, res, term, limit, offset, limExist, offExist);
      else {
        return self._queryDB(self, res, term, limit, offset, limExist, offExist);
      }
    }
  };

  QueryController.prototype._getAll = function(self, res, lim, off, limExist, offExist){
    self.m_model.forge()
      .query(function (qb) {
        if(offExist){
          qb.offset(off);
        }
        if(limExist){
          qb.limit(lim);
        }
        qb.orderBy('NAME');
      })
      .fetchAll()
      .then(function(result){
        return res.send(result);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

QueryController.prototype._queryAlias = function(self, res, term, lim, off, limExist, offExist){
    self.m_alias.forge()
      .query(function (qb) {
        if(limExist){
          qb.limit(lim);
        }
        if(offExist){
          qb.offset(off);
        }

        qb.groupBy('PRIMARY_NAME');
        qb.orderBy('ALIAS', 'ASC');
        qb.column('PRIMARY_NAME', 'ALIAS');
      })
      .where('ALIAS', 'LIKE', term+'%')
      .fetchAll()
      .then(function(result){
        return res.send(result);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

QueryController.prototype._queryDB = function(self, res, term, lim, off, limExist, offExist){
    self.m_model.forge()
      .query(function (qb) {
        if(limExist){
          qb.limit(lim);
        }
        if(offExist){
          qb.offset(off);
        }

        qb.column('NAME');
      })
      .where('NAME', 'LIKE', term+'%')
      .fetchAll()
      .then(function(result){
        return res.send(result);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

var Wrapper = {};

Wrapper.InstController = new QueryController(Institution, InstAlias);

Wrapper.LangController = new QueryController(Language, LangAlias);

Wrapper.AgencyController = new QueryController(Agency, AgencyAlias);

Wrapper.TagController = new QueryController(Tag);


module.exports = Wrapper;
