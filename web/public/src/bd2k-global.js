//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  BD2K
//
var BD2K = BD2K || function() {};


//*********************************************************************************
//  Utility
//*********************************************************************************

//--- copy ------------------------------------------------------------------------------
BD2K.copy = function(from, to){
    to.length = 0;
    for (var i=0; i<from.length; i++){
        to.push(from[i]);
    }
};

//--- unique ------------------------------------------------------------------------------
BD2K.unique = function (arr) {
    var a = arr.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

//--- ready ------------------------------------------------------------------------------
BD2K.ready = function (func) {
    if ($.isReady){
        func();
    }
    else {
        $(func);
    }
};

//----- has -----------------------------------------------------------------
BD2K.has = function (properties) {

    if(!(Object.prototype.toString.call(properties) === '[object Array]')) {
        return typeof  properties != "undefined";
    }

    for (var i=0; i<properties.length; i++){
        if (typeof properties[i] == "undefined"){
            return false;
        }
    }

    return true;
};

//----- count -----------------------------------------------------------------
BD2K.count = function (hash) {
    var size = 0, key;
    for (key in hash) {
        if (hash.hasOwnProperty(key)) size++;
    }
    return size;
};

//----- request -----------------------------------------------------------------
BD2K.request = function (path, params, method ) {

    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    $("form").last().submit();
};
