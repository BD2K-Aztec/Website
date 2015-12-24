function Info(resource, neo4j) {
    var acc = "";
    if (resource.name) {
        var typeArr = [];
        var typeStr = "";

        if(resource.types){
            for(var i = 0; i < resource.types.length; i++){
                if (resource.types[i].match(/widget/i)) {
                    typeArr.push("W");
                }
                else if (resource.types[i].match(/database/i)) {
                    typeArr.push("D");
                }
                else if (resource.types[i].match(/tool/i)) {
                    typeArr.push("T");
                }
            }
        }

        if(typeArr.length === 0)
            typeArr.push("O");

        for(var i = 0; i < typeArr.length; i++){
            typeStr += '<span class="icon-stack" style="margin-bottom:5px;"><i class="icon-sign-blank icon-stack-base" style="color: ';

            if(typeArr[i]==="T"){
                typeStr += 'rgb(135, 172, 235)';
            } else if(typeArr[i]==="W"){
                typeStr += 'rgb(135, 206, 235)';
            } else if(typeArr[i]==="D"){
                typeStr += 'rgb(135, 139, 235)';
            } else {
                typeStr += 'rgb(164, 135, 235)';
            }
            typeStr += '"></i>';


            typeStr += '<span class="icon-fixed-width icon-light char-overlay" style="padding:0px;font-weight:600">' + typeArr[i] + '</span></span>';

        }

        $("#name").html(typeStr + '<span style="margin-left:15px; font-weight:600; font-style:bold">' + resource.name + '</span>');
        $("[data-icon]").html(typeStr + '<span style="margin-left:15px; font-weight:600; font-style:bold">' + resource.name[0] + '</span>');

        //if(resource.editable){
            $("#name").html($("#name").html() + '&nbsp; &nbsp; <a href="/tool/edit?id=' + resource.id + '" class="btn btn-info" role="button">Edit Resource</a>') //change: put in if block
        //}
    }
    if (resource.description) {
        acc += createAcc("Description", resource.description);
    }
    var linkArr = [];

    if (resource.sourceCodeURL) {
        linkArr.push("Source Code: <a href='" + resource.sourceCodeURL + "'>" + resource.sourceCodeURL + "</a>");
    }

    if (resource.linkDescriptions) {
        for (var i in resource.linkDescriptions) {
            if(resource.linkUrls[i])
                linkArr.push(resource.linkDescriptions[i] + ": " + "<a href='" + resource.linkUrls[i] + "'>" + resource.linkUrls[i] + "</a>");
        }
    }
    if (linkArr.length > 0){
        acc += createAccList("Links", linkArr);
    }
    if (resource.publicationDOI) {
        var dois = [resource.publicationDOI];
        if(resource.otherPublicationDOI)
            dois = [resource.publicationDOI].concat(resource.otherPublicationDOI);
        var doiArr = [];
        for(var i = 0; i < dois.length; i++){
            var doi = dois[i].replace(/ *\([^)]*\) */g, "");;
            doiArr.push('DOI: <a href="http://dx.doi.org/' + doi.substring(4).trim() + '">' + doi.substring(4).trim() + '</a>');
        }
        acc += createAccList("Publication DOIs", doiArr);
    }
    if (resource.toolDOI) {
        acc += createAcc("Tool DOI", resource.toolDOI);
    }
    if (resource.versionNum) {
        acc += createAcc("Version Number", resource.versionNum);
    }
    if (resource.versionDate) {
        acc += createAcc("Version Date", resource.versionDate);
    }
    if (resource.types) {
        acc += createAccList("Resource Types", resource.types);
    }
    var regEx = /<|>/g;
    if (resource.licenses) {
        var licenseArr = [];
        for(var i = 0; i < resource.licenses.length; i++){
            if(resource.licenseUrls[i].length > 0){
                licenseArr.push(resource.licenses[i] + " &lt;" + resource.licenseUrls[i].replace(regEx,"") + "&gt;");
            }
            else
                licenseArr.push(resource.licenses[i]);
        }
        acc += createAccList("Licenses", licenseArr);
    }
    if (resource.domains) {
        acc += createAccList("Domains", resource.domains);
    }
    if (resource.dataTypes) {
        acc += createAccList("Data Types", resource.dataTypes);
    }
    if (resource.platforms) {
        acc += createAccList("Platforms", resource.platforms);
    }
    if (resource.language) {
        acc += createAcc("Language", resource.language);
    }
    if(resource.authors){
        var authorArr = [];
        for(var i = 0; i < resource.authors.length; i++){
            if(resource.authorEmails && resource.authorEmails[i] > 0){
                authorArr.push(resource.authors[i] + " &lt;" + resource.authorEmails[i].replace(regEx,"") + "&gt;");
            }
            else
                authorArr.push(resource.authors[i]);
        }
        acc += createAccList("Authors", authorArr);
    }
    if(resource.maintainers){
        var maintainerArr = [];
        for(var i = 0; i < resource.maintainers.length; i++){
            if(resource.maintainerEmails && resource.maintainerEmails[i].length > 0){
                maintainerArr.push(resource.maintainers[i] + " &lt;" + resource.maintainerEmails[i].replace(regEx,"") + "&gt;");
            }
            else
                maintainerArr.push(resource.maintainers[i]);
        }
        acc += createAccList("Maintainers", maintainerArr);
    }
    if(resource.institutions){
        acc += createAccList("Institutions", resource.institutions);
    }
    if(resource.funding){
        acc += createAccList("Funding", resource.funding);
    }
    if(resource.dependencies){
        acc += createAccList("Dependencies", resource.dependencies);
    }
    if (resource.source) {
        acc += createAcc("Source", resource.source);
    }
    if(resource.tags){
        var tagsHtml = "";
        tagsHtml += '<div class="row" id="tagRemove" align="left" ><div class="tag col-lg-12">';
        for(var i = 0; i < resource.tags.length; i++){
            tagsHtml += '&nbsp;<button type="button" class="btn btn-info btn-xs"><i class="fa fa-tag"></i>&nbsp;' + resource.tags[i] + '</button>';
        }
        tagsHtml += '</div></div>';
        //$("#tag").html('<b>Tags: </b><span>' + tagsHtml + '</span>');
        acc += createAcc("Tags", tagsHtml);
    }

    var svgElement = document.getElementsByTagName("svg");
    $("svg").css("width", "100%");
    //svgElement[0].setAttribute("width", "100%");
    //svgElement[0].removeAttribute("height");

    $("#accordion").html(acc);
    $('#submitTopForm').submit(function() {
        filteredBy = ["name", "description", "id", "authors"];
        filtersText = $("#topQuery").val();

        inputTypes = [];
        inputFilters = [];

        var filters = {};

        for (i = 0; i < filteredBy.length; i++) {
            filters[filteredBy[i]] = filtersText;
            inputTypes.push(filteredBy[i]);
            inputFilters.push(filtersText);
        }

        var parameters = {};
        parameters.searchFilters = filters;

        $("#sendTopJson").val(JSON.stringify(parameters));
        $("#submitTopForm").submit();
        return false; // return false to cancel form action
    });

//    function idIndex(a,id) {
//        for (var i=0;i<a.length;i++) {
//            if (a[i].id == id) return i;}
//        return null;
//    }
//    var nodes=[], links=[];
//    neo4j.data.forEach(function (row) {
//        row.graph.nodes.forEach(function (n) {
//            if (idIndex(nodes,n.id) == null)
//                nodes.push({id:n.id,label:n.labels[0],title:n.properties.name});
//        });
//        links = links.concat( row.graph.relationships.map(function(r) {
//            return {source:idIndex(nodes,r.startNode),target:idIndex(nodes,r.endNode),type:r.type};
//        }));
//    });
//    var graph = {nodes:nodes, links:links};
//    var width = 800, height = 800;
//// force layout setup
//    var force = d3.layout.force()
//        .charge(-200).linkDistance(30).size([width, height]);
//
//// setup svg div
//    var svg = d3.select("#workflowGraph1").append("svg")
//        .attr("width", "100%").attr("height", "100%")
//        .attr("pointer-events", "all");
//
//    force.nodes(graph.nodes).links(graph.links).start();
//
//    // render relationships as lines
//    var link = svg.selectAll(".link")
//        .data(graph.links).enter()
//        .append("line").attr("class", "link");
//
//    // render nodes as circles, css-class from label
//    var node = svg.selectAll(".node")
//        .data(graph.nodes).enter()
//        .append("circle")
//        .attr("class", function (d) { return "node "+d.label })
//        .attr("r", 10)
//        .call(force.drag);
//
//    // html title attribute for title node-attribute
//    node.append("title")
//        .text(function (d) { return d.title; })
//
//    // force feed algo ticks for coordinate computation
//    force.on("tick", function() {
//        link.attr("x1", function(d) { return d.source.x; })
//            .attr("y1", function(d) { return d.source.y; })
//            .attr("x2", function(d) { return d.target.x; })
//            .attr("y2", function(d) { return d.target.y; });
//
//        node.attr("cx", function(d) { return d.x; })
//            .attr("cy", function(d) { return d.y; });
//    });
}
accCount = 0;
function createAcc(header, text){
    var ret = '<div class="panel panel-default" style="margin-bottom:15px"> <div class="panel-heading" style="background-image: linear-gradient(to bottom,#d6ebf2 0,#BBD2DB 100%); background-color: white; color:midnightblue"role="tab" id="heading'
    ret += accCount;
    ret += '"> <h4 class="panel-title"> <span role="button" data-toggle="collapse" href="#collapse';
    ret += accCount;
    ret += '" aria-expanded="true" aria-controls="collapse'
    ret += accCount + '">';
    ret += '<b>' + header + '</b>';
        ret += '&nbsp; &nbsp;<i class="fa fa-caret-down"></i></span></h4> </div> <div id="collapse';
    ret += accCount;
    ret += '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading'
    ret += accCount;
    ret += '"><div class="panel-body" style="background-image: linear-gradient(to bottom,#eef7fa 0,#f6fbfc 100%); padding-left:25px">';
    ret += text;
    ret += '</div></div></div>';
    accCount++;
    return ret;
}

function createAccList(header, arr){
    var ret = '<div class="panel panel-default" style="margin-bottom:15px"> <div class="panel-heading" style="background-image: linear-gradient(to bottom,#d6ebf2 0,#BBD2DB 100%); background-color: white; color:midnightblue"role="tab" id="heading'
    ret += accCount;
    ret += '"> <h4 class="panel-title"> <span role="button" data-toggle="collapse" href="#collapse';
    ret += accCount;
    ret += '" aria-expanded="true" aria-controls="collapse'
    ret += accCount + '">';
    ret += '<b>' + header + '</b>';
    ret += '&nbsp; &nbsp;<i class="fa fa-caret-down"></i></span></h4> </div> <div id="collapse';
    ret += accCount;
    ret += '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading'
    ret += accCount;
    ret += '"><ul class="list-group">';
    for(var i = 0; i < arr.length; i++)
        ret += '<li class="list-group-item" style="background-image: linear-gradient(to bottom,#eef7fa 0,#f6fbfc 100%); padding-left:25px">' + arr[i] + '</li>';
    ret += '</ul></div></div>';
    accCount++;
    return ret;
}