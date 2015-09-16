//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  HomeController
//
function HomeController() {
    var self = this;

    this.index = function(req, res) { self._index(self, req, res); };
    this.overview = function(req, res) { self._overview(self, req, res); };
    this.metadata = function(req, res) { self._metadata(self, req, res); };
    this.technologies = function(req, res) { self._technologies(self, req, res); };
    this.sources = function(req, res) { self._sources(self, req, res); };
}

//--- index -----------------------------------------------------------------------
HomeController.prototype._index = function (self, req, res) {
    res.render("home/index");
};

//--- overview -----------------------------------------------------------------------
HomeController.prototype._overview = function (self, req, res) {
    res.render("home/overview");
};

//--- metadata -----------------------------------------------------------------------
HomeController.prototype._metadata = function (self, req, res) {
    res.render("home/metadata");
};

//--- technologies -----------------------------------------------------------------------
HomeController.prototype._technologies = function (self, req, res) {
    res.render("home/technologies");
};

//--- sources -----------------------------------------------------------------------
HomeController.prototype._sources = function (self, req, res) {
    res.render("home/sources");
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = new HomeController();
