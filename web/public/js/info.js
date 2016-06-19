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

        $("#name").html(typeStr + '<span style="margin-left:15px; font-weight:600; font-weight:bold">' + resource.name + '</span>');
        $("[data-icon]").html(typeStr + '<span style="margin-left:15px; font-weight:600; font-weight:bold">' + resource.name[0] + '</span>');

        if(resource.editable){
            $("#name").html($("#name").html() + '&nbsp; &nbsp; <a href="/tool/edit?id=' + resource.id + '" class="btn btn-info" role="button">Edit Resource</a>') //change: put in if block
        }
    }
    var tDescription = "NA";
    if (resource.description) {
        tDescription = resource.description;
    }
    $("#tdescription").html(tDescription);
    
    var linkArr = [];

    if (resource.sourceCodeURL) {
        linkArr.push("Source Code: <a href='" + resource.sourceCodeURL + "'>" + resource.sourceCodeURL + "</a>");
        var tSourcecode_list = [];
        tSourcecode_list.push("<a href='" + resource.sourceCodeURL + "'>" + resource.sourceCodeURL + "</a></div>");
        var tSourcecode = createList(tSourcecode_list);
    }
    else{
        var tSourcecode = createList(["NA"]);
    }

    $("#tsourcecode").html(tSourcecode);

    if (resource.linkDescriptions) {
        for (var i in resource.linkDescriptions) {
            if(resource.linkUrls[i])
                linkArr.push(resource.linkDescriptions[i] + ": " + "<a href='" + resource.linkUrls[i] + "'>" + resource.linkUrls[i] + "</a>");
        }
    }
    var tHomepage_url_list=["NA"];
    if (resource.linkDescriptions) {
        tHomepage_url_list = [];
        for (var i in resource.linkDescriptions) {
            if(resource.linkDescriptions[i] == "Homepage" && resource.linkUrls[i])
                tHomepage_url_list.push("<a href='" + resource.linkUrls[i] + "'>" + resource.linkUrls[i] + "</a>");
        }
        if (tHomepage_url_list.length == 0){
            tHomepage_url_list.push('NA')
        }
    }
    var tHomepage_url = createList(tHomepage_url_list)
    $("#thomepage_url").html(tHomepage_url);


    // didn't show in this version
    if (resource.toolDOI) {
        acc += createAcc("Tool DOI", resource.toolDOI);
    }
    if (resource.versionNum) {
        acc += createAcc("Version Number", resource.versionNum);
    }
    if (resource.versionDate) {
        acc += createAcc("Version Date", resource.versionDate);
    }
    //
    var tTypes_list = ['NA'];
    if (resource.types) {
        tTypes_list = resource.types;
    }
    var tTypes = createList(tTypes_list);
    $("#ttypes").html(tTypes);

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
        var tLicense= licenseArr.join('; ').trim();
    }
    else{
        var tLicense = "No License";
    }
    $("#tlicense").html(tLicense);
    //not use
    if (resource.domains) {
        acc += createAccList("Domains", resource.domains);
    }
    //
    var tDatatypes ="NA";
    if (resource.dataTypes) {
        acc += createAccList("Data Types", resource.dataTypes);
        tDatatypes = resource.dataTypes;
    }
    $("#tdatatypes").html(tDatatypes);
    
    var tPlatforms = "NA";
    if (resource.platforms) {
        tPlatforms = createList(resource.platforms);
    }
    else{
        tPlatforms = createList(['NA']);
    }
    $("#tplatforms").html(tPlatforms);

    if (resource.language) {
        var tLanguage_list=[];
        tLanguage_list.push(resource.language);
        var tLanguage = createList(tLanguage_list);
    }
    else{
        var tLanguage = createList(['NA']);
    }
    $("#tlanguage").html(tLanguage);
    
    var tAuthor = "";
    if(resource.authors){
        var authorArr = [];
        for(var i = 0; i < resource.authors.length; i++){
            if(resource.authorEmails && resource.authorEmails[i] > 0){
                authorArr.push(resource.authors[i] + " &lt;" + resource.authorEmails[i].replace(regEx,"") + "&gt;");
            }
            else
                authorArr.push(resource.authors[i]);
        }
        tAuthor = authorArr.join('; ');
    }
    $("#tauthor").html(tAuthor);

    if(resource.maintainers){
        var maintainerArr = [];
        for(var i = 0; i < resource.maintainers.length; i++){
            if(resource.maintainerEmails && resource.maintainerEmails[i].length > 0){
                maintainerArr.push(resource.maintainers[i] + " &lt;" + resource.maintainerEmails[i].replace(regEx,"") + "&gt;");
            }
            else
                maintainerArr.push(resource.maintainers[i]);
        }
        var tMaintainers = createList(maintainerArr);
    }
    else{
        var tMaintainers = createList(["NA"]);
    }
    $("#tmaintainers").html(tMaintainers);
    
    var tInstitutions = "";
    if(resource.institutions){
        acc += createAccList("Institutions", resource.institutions);
        tInstitutions = resource.institutions.join('; ');
        $("#tinstitutions_2").html(createList(resource.institutions));
    }
    else{
        $("#tinstitutions_2").html(createList(['NA']));
    }

    $("#tinstitutions").html(tInstitutions);

    var tFundings="";
    if(resource.funding){
        tFundings = createList(resource.funding);
    }
    else{
        tFundings = createList(['NA'])
    }
    $("#tfundings").html(tFundings);

    // not use
    if(resource.dependencies){
        acc += createAccList("Dependencies", resource.dependencies);
    }
    //
    var tSource ="";
    if (resource.source) {
        tSource = createList(resource.source);
    }
    $("#tsource").html(tSource);

    var tTag = "";
    if(resource.tags){
        var tagsHtml = "";
        tagsHtml += '<div class="row" id="tagRemove" align="left"><div class="tag col-lg-12"  style="padding-bottom: 5px;padding-top: 5px">';
        for(var i = 0; i < resource.tags.length; i++){
            tagsHtml += '&nbsp;<button type="button" class="btn btn-info btn-xs" style="font-weight: bold;font-size:14px;border-radius:10px;margin-bottom:5px;padding-left:12px;padding-right: 12px">' + resource.tags[i] + '</button>';
        }
        tagsHtml += '</div></div>';
        //$("#tag").html('<b>Tags: </b><span>' + tagsHtml + '</span>');
        tTag = tagsHtml;
    }
    $("#ttagsHtml").html(tTag);

    var doiArr = ['NA'];
    //var outPublication = "Not Available";
    var outPublication = "";
    if (resource.publicationDOI) {
        var dois = [resource.publicationDOI];
        console.log("dois are ");
        console.log(dois);// new console log
        if(resource.otherPublicationDOI)
            dois = [resource.publicationDOI].concat(resource.otherPublicationDOI);
        var doiArr = [];
        for(var i = 0; i < dois.length; i++){
            var doi = dois[i].replace(/ *\([^)]*\) */g, "");
            doiArr.push('DOI: <a href="http://dx.doi.org/' + doi.substring(4).trim() + '">' + doi.substring(4).trim() + '</a>');
        }
        var doiCrossref = dois[0].replace(/ *\([^)]*\) */g, "").substring(4).trim();
        if( !isNaN(doiCrossref[0])){ //still some invalid doi in our database
            //PublicationInfo = getPublication(doiCrossref);//string(JSON) from crossref
            getPublication(doiCrossref);
            //var outPublication = changeFormatPublication(PublicationInfo);
            //changeFormatCitationAPA(PublicationInfo);
            //changeFormatCitation(doiCrossref); //for Cite part
            /*if(PublicationInfo!=""){
                var outPublication = changeFormatPublication(PublicationInfo);
                changeFormatCitationAPA(PublicationInfo);
                changeFormatCitation(doiCrossref); //for Cite part
            } //for PUBLICATION part*/
            // else{
            //     $("#citationAPAinfo").html("Not Available")
            // }
        }
        else{
            $("#citationAPAinfo").html("Not Available");
            $("#citationBibinfo").html("Not Available");
        }
    }
    else {
        $("#citationAPAinfo").html("Not Available");
        $("#citationBibinfo").html("Not Available");
    }
    //$("#publicationinfo").html(outPublication);
    //tPublications = createList(doiArr);
    //$("#tpublications").html(tPublications);

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

//popup citation
    var modal = document.getElementById('citationAPA');
    var modal2 = document.getElementById('citationBibTex');
    var citation = document.getElementById('citation');
    var bib = document.getElementById('bibtex');
    var span1 = document.getElementsByClassName("close")[0];
    var span2 = document.getElementsByClassName("close")[1];

    citation.addEventListener('click', popupCitation1);
    function popupCitation1(){
        //alert("Publication Information");
        modal.style.display = "block";

    }
    bib.addEventListener('click', popupCitation2);
    span2.onclick = function() {
        modal2.style.display = "none";
    }

    function popupCitation2(){
        //alert("Publication Information");
        modal2.style.display = "block";
    }
    span1.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == modal2) {
            modal2.style.display = "none";
        }
    }





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

function createList(arr){
    var ret = "";
    ret += '<div class="list-group">';
    for(var i = 0; i < arr.length; i++)
        ret += '<li class="" style="padding-left:33px">' + arr[i] + '</li>';
    ret += '</div>';
    return ret;
}


// get publication information by DOI
function setXMLHttpRequest() {
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xhr;
}

var xmlhttp = setXMLHttpRequest();
var xmlhttp2 = setXMLHttpRequest();
function getPublication(DOI){
    var information = "";
    var url = 'https://api.crossref.org/works/'+DOI+'/transform/application/vnd.citationstyles.csl+json';//application/x-bibtex'
    xmlhttp.open("GET",url,true);//syn or asynronous????
    //alert(xmlhttp.status);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //var outPublication='<div class="row" style="margin:20px"><div class="col-md-1"></div><div class="col-md-10" style="padding:20px"><div class="" style="overflow:hidden;margin-right:20px; margin-left:20px" align="left"><h3 class="text-center">PUBLICATIONS</h3></div></div></div>';
            var JSONinfo = JSON.parse(xmlhttp.responseText);
            var outPublication = '<div class="col-md-1"></div><div class="col-md-10" style="background-color:#FFFFFF;padding:20px"><div class="" style="overflow:hidden;margin-right:20px; margin-left:20px" align="left">';
            outPublication = outPublication+'<div class="row" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Title:</h4><div style="padding-left:33px;margin-bottom: 10px">';
            outPublication = outPublication+JSONinfo.title+'</div></div>';
            outPublication = outPublication+'<div class="row" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Author:</h4><div style="padding-left:33px;margin-bottom: 10px">';
            for(var i=0;i<JSONinfo.author.length;i++){
                outPublication=outPublication+JSONinfo.author[i].family+', '+JSONinfo.author[i].given+'; ';
            }
            outPublication = outPublication+'</div></div>';
            outPublication = outPublication+'<div class="row"><div class="col-md-6" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Journal:</h4><div style="padding-left:33px;margin-bottom: 10px">'+JSONinfo['container-title']+'</div></div>';
            outPublication = outPublication+'<div class="col-md-6" style="padding-left:20px"><div class="" style="overflow:hidden;margin-right:20px; margin-left:20px" align="left"><h4 class="text-left" style="font-weight:bold">Date:</h4><div style="padding-left:33px;margin-bottom: 10px">'+mapDate(JSONinfo.deposited['date-parts'][0])+'</div></div></div>';
            outPublication = outPublication+'<div class="col-md-4"><h4 class="text-left" style="font-weight:bold">Publications:</h4><div style="padding-left:33px">'+'DOI: <a href="http://dx.doi.org/' + JSONinfo.DOI + '">' + JSONinfo.DOI + '</a>'+'</div></div></div>';
            outPublication=outPublication+'</div></div>';
            document.getElementById("pubtitle").innerHTML = "PUBLICATIONS";
            document.getElementById("publicationinfo").innerHTML = outPublication;
            var outAPA = "<h4>APA</h4><p>";
            //var JSONinfo = JSON.parse(information);
            for(var i=0;i<JSONinfo.author.length-1;i++){
                outAPA=outAPA+JSONinfo.author[i].family+", ";
                var givenname = JSONinfo.author[i].given.split(" ");
                for(var j = 0; j<givenname.length;j++){
                    outAPA=outAPA+givenname[j][0]+". ";
                }
                outAPA=outAPA+', ';
            }
            outAPA=outAPA+JSONinfo.author[JSONinfo.author.length-1].family+", ";
            var givenname = JSONinfo.author[i].given.split(" ");
            for(var j = 0; j<givenname.length;j++){
                outAPA=outAPA+givenname[j][0]+". ";
            }
            outAPA=outAPA+"("+JSONinfo.deposited['date-parts'][0][0]+"). ";
            outAPA=outAPA+JSONinfo.title+". ";
            outAPA=outAPA+ JSONinfo['container-title']+", ";
            outAPA=outAPA+JSONinfo['volume'] +"("+JSONinfo['issue']+"), ";
            outAPA=outAPA+JSONinfo['page']+".</p>";
            //outAPA=outAPA+"<a id = 'bibtex' href='#'>Bibtex</a>";
            document.getElementById("citationAPAinfo").innerHTML = outAPA;
            //document.getElementById("citationAPAinfo").innerHTML = outAPA;
        }
        else if(xmlhttp.status = 404){
            document.getElementById("citationAPAinfo").innerHTML = "Not Available";
        }
        //alert(xmlhttp.readyState);
    }
    xmlhttp.send();
    getCitation(DOI,"x-bibtex");
    //information=xmlhttp.responseText;
    //return information;
}

function getCitation(DOI,type) {
    var information = "";
    var url = 'https://api.crossref.org/works/' + DOI+ '/transform/application/'+type;//text/x-bibliography?style='+type;
    xmlhttp2.open("GET", url, true);//syn or asynronous????
    //xmlhttp.setRequestHeader("Accept","text/bibliography; style=bibtex");
    xmlhttp2.onreadystatechange = function () {
        if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
            var formatstring='<h4>BibTeX</h4><pre style = "text-align:left">';
            formatstring=formatstring+xmlhttp2.responseText+'</pre>';
            document.getElementById("citationBibinfo").innerHTML = formatstring;
        }
        else if (xmlhttp2.status == 404){
            document.getElementById("citationBibinfo").innerHTML = "Not Available";
        }
    }
    xmlhttp2.send();
}
// function changeFormatCitationAPA(information){
//     var outAPA = "<h4>APA</h4><p>";
//     var JSONinfo = JSON.parse(information);
//     for(var i=0;i<JSONinfo.author.length-1;i++){
//         outAPA=outAPA+JSONinfo.author[i].family+", ";
//         var givenname = JSONinfo.author[i].given.split(" ");
//         for(var j = 0; j<givenname.length;j++){
//             outAPA=outAPA+givenname[j][0]+". ";
//         }
//         outAPA=outAPA+', ';
//     }
//     outAPA=outAPA+JSONinfo.author[JSONinfo.author.length-1].family+", ";
//     var givenname = JSONinfo.author[i].given.split(" ");
//     for(var j = 0; j<givenname.length;j++){
//         outAPA=outAPA+givenname[j][0]+". ";
//     }
//     outAPA=outAPA+"("+JSONinfo.deposited['date-parts'][0][0]+"). ";
//     outAPA=outAPA+JSONinfo.title+". ";
//     outAPA=outAPA+ JSONinfo['container-title']+", ";
//     outAPA=outAPA+JSONinfo['volume'] +"("+JSONinfo['issue']+"), ";
//     outAPA=outAPA+JSONinfo['page']+".</p><a id = 'bibtex' href = '#'>BibTex</a>";
//     document.getElementById("citationAPAinfo").innerHTML = outAPA;
// }
// function changeFormatPublication(information){
//     var outPublication="";
//     var JSONinfo = JSON.parse(information);
//     outPublication = '<div class="row" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Title:</h4><div style="padding-left:33px;margin-bottom: 10px">'+JSONinfo.title+'</div></div>';
//     outPublication = outPublication+'<div class="row" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Author:</h4><div style="padding-left:33px;margin-bottom: 10px">';
//     for(var i=0;i<JSONinfo.author.length;i++){
//         outPublication=outPublication+JSONinfo.author[i].family+', '+JSONinfo.author[i].given+'; ';
//     }
//     outPublication = outPublication+'</div></div>';
//     outPublication = outPublication+'<div class="row"><div class="col-md-6" style="padding-left:20px"><h4 class="text-left" style="font-weight:bold">Journal:</h4><div style="padding-left:33px;margin-bottom: 10px">'+JSONinfo['container-title']+'</div></div>';
//     outPublication = outPublication+'<div class="col-md-6" style="padding-left:20px"><div class="" style="overflow:hidden;margin-right:20px; margin-left:20px" align="left"><h4 class="text-left" style="font-weight:bold">Date:</h4><div style="padding-left:33px;margin-bottom: 10px">'+mapDate(JSONinfo.deposited['date-parts'][0])+'</div></div></div>';
//     //outPublication = outPublication+'<div class="col-md-4"><h4 class="text-left" style="font-weight:bold">Publications:</h4><div style="padding-left:33px">'+'DOI: <a href="http://dx.doi.org/' + JSONinfo.DOI + '">' + JSONinfo.DOI + '</a>'+'</div></div></div>';
//     $("#publicationinfo").html(outPublication);
//     //return outPublication;
// }

// function changeFormatCitation(DOI){
//     ///var formatstring='<div class ="row"><div class="col-md-2">BibTeX</div><div class="col-md-8" id = "x-bibtexinfo"></div></div>';
//     var formatstring='<h4>BibTeX</h4><p id = "x-bibtexinfo"></p>';
//     //console.log(Console);
//     ////formatstring = formatstring+'<div class ="row"><div class="col-md-2">APA</div><div class="col-md-8" id = "apainfo"></div></div>';
//     document.getElementById("citationBibinfo").innerHTML = formatstring;
//     //getCitation(DOI,'chicago-annotated-bibliography');
//     getCitation(DOI,"x-bibtex");
// }

function mapDate(Date){
    var monthList=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var newDate=monthList[Date[1]-1]+' '+Date[2].toString()+', '+Date[0].toString();
    return newDate;
}