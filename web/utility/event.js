var BD2K = require("./bd2k.js");

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  Event
//

function Event(){
    var self = this;
    this.register = function (handler) { return self._register(self, handler); };
    this.fire = function (event) { self._fire(self, event); };
    this.Handlers = [];
}

//--- register ------------------------------------------------------------------------------
Event.prototype._register = function (self, handler) {

    if (!BD2K.has(handler)) { return; }

    var returnMutator = {};
    returnMutator.append = function(append) { self._append = append;  };
    self.Handlers.push(handler);
    return returnMutator;
};

//--- fire ------------------------------------------------------------------------------
Event.prototype._fire = function (self, event) {

    var append = self._append || {};

    for(var name in append) {
        event[name] = append[name];
    }

    for (var i = self.Handlers.length - 1; i >= 0; i--) {
        var handler = self.Handlers[i];
        self.Handlers.splice(i, 1);
        handler(event, this, arguments.callee.caller);
    }
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

module.exports = Event;