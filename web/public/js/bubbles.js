var retry_limit_time = 10;

/**
 * @class TagBubbles
 * @constructor
 * @classdesc creates the tag bubble chart
 */
var TagBubbles = function(){
    var diameter = 300,
        format = d3.format(",d"),
        color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#tagBubbles").append("svg") //select the id to place bubble graph
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    d3.json('/resource/stat?type=tags', function(error, root) { //get the statistics
        if (error) throw error;

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(root))
                .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .on("click", function(){
                var stringify = {};
                var filters = {};
                filters.tags = $(this).find("#fullLabel").text();
                stringify.searchFilters = filters;
                stringify.strict = {};
                var input = JSON.stringify(stringify);
                location.href = "resource/search?input=" + encodeURIComponent(input);
            })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("font-size", function(d){return d.r / 3 + "px"})
            .style("text-anchor", "middle")
            .text(function(d) { if(d.value > 100) return d.className.substring(0, d.r / 3 - 1); });

        node.append("text")
            .style("visibility", "hidden")
            .attr("id", "fullLabel")
            .text(function(d) {return d.className; });
    });

// Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
        var classes = [];

        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
        }

        recurse(null, root);
        return {children: classes};
    }

    d3.select(self.frameElement).style("height", diameter + "px");
};

/**
 * @class PlatformBubbles
 * @constructor
 * @classdesc creates the platform bubble chart
 */
var PlatformBubbles = function(){
    var diameter = 300,
        format = d3.format(",d"),
        color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#platformBubbles").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    d3.json('/resource/stat?type=platforms', function(error, root) {
        if (error) throw error;

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(root))
                .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .on("click", function(){
                var stringify = {};
                var filters = {};
                filters.platforms = $(this).find("#fullLabel").text();
                stringify.searchFilters = filters;
                stringify.strict = {};
                var input = JSON.stringify(stringify);
                location.href = "resource/search?input=" + encodeURIComponent(input);
            })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { if(d.value > 50 && d.className !== "command") return d.className; else return ""});

        node.append("text")
            .style("visibility", "hidden")
            .attr("id", "fullLabel")
            .text(function(d) {return d.className; });
    });

// Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
        var classes = [];

        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
        }

        recurse(null, root);
        return {children: classes};
    }

    d3.select(self.frameElement).style("height", diameter + "px");
};