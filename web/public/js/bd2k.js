var BD2K = {};

BD2K.Resource = {};

BD2K.ready = function(func) {

    var completed = 0;
    var seen = {};

    var depend1 = true;
    var depend2 = true;

    var onload = function(src, addDependentScript){
        if (seen[src] == true) { return; }
        seen[src] = true;
        completed++;
        if (completed == 1) { BD2K.ready(func); }


    };

    var addScript = function(src) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onreadystatechange = function() {onload(src, addScript);};
        script.onload = function() {onload(src, addScript);};
        script.src = src;
        head.appendChild(script);
    };

    addScript("/public/src/bd2k-global.js");
};