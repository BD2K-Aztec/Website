var BD2K = require("./bd2k.js");

/**
 * @class Event
 * @constructor
 * @classdesc registers and fires (runs) callbacks
 */
function Event(){
    var self = this;
    this.register = function (handler) { return self._register(self, handler); };
    this.fire = function (event) { self._fire(self, event); };
    this.Handlers = [];
}

/**
 * registers a callback to the event
 * @memberOf Event
 * @function
 * @alias register
 * @param {Function} handler - callback function to register
 */
Event.prototype._register = function (self, handler) {

    if (!BD2K.has(handler)) { return; }

    var returnMutator = {};
    returnMutator.append = function(append) { self._append = append;  };
    self.Handlers.push(handler);
    return returnMutator;
};

/**
 * fires a callback function
 * @memberOf Event
 * @function
 * @alias fire
 * @param {Function} event - event that triggers the callback function
 */
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

module.exports = Event;