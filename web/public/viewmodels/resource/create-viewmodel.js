function NewTool(types, domains, platforms, fileTypes, preset) {

    var self = this;
    $("#domain").val("");
    $("#softwareType").val("");
    //for(var i = 0; i < types.length; i++){
    //    $("#typeDiv").append('<input type="checkbox" class="types" value="' + types[i].TypeID + '">' + types[i].Type + '<br>');
    //}
    //
    //for(var i = 0; i < domains.length; i++){
    //    $("#domainDiv").append('<input type="checkbox" class="domains" value="' + domains[i].DomainID + '">' + domains[i].Type + '<br>');
    //}
    //
    //for(var i = 0; i < platforms.length; i++){
    //    $("#platformDiv").append('<input type="checkbox" class="platforms" value="' + platforms[i].PlatformID + '">' + platforms[i].Platform + '<br>');
    //}
    //
    //for(var i = 0; i < fileTypes.length; i++){
    //    $("#inputFileDiv").append('<input type="checkbox" class="inputFiles" value="' + fileTypes[i].FileID + '">' + fileTypes[i].Type + ': ' + fileTypes[i].Description + '<br>');
    //}
    //
    //for(var i = 0; i < fileTypes.length; i++){
    //    $("#outputFileDiv").append('<input type="checkbox" class="outputFiles" value="' + fileTypes[i].FileID + '">' + fileTypes[i].Type + ': ' + fileTypes[i].Description + '<br>');
    //}

    $('#submitForm').submit(function() {

        var filtersText = $("#query").val();
        var filters = {};
        filters["resource"] = filtersText;

        var parameters = {};

        parameters.searchFilters = filters;
        parameters.searchUuids = [];

        $("#sendJson").val(JSON.stringify(parameters));
    });

    id = 0;
    $("#linkButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default bd2k-panel" style="position:relative; padding:10px;" id="div' + tempid + '"> Link Description: <span class="linkDescs">' + $("#linkDesc").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Link</button>';
            newLink += '<br>Link URL: <span class="linkURLs">' + $("#linkURL").val() + '</span></div>';
            $("#links").html($("#links").html() + newLink);
            id++;

            $("#linkDesc").val("");
            $("#linkURL").val("");
        }
    );

    $("#licenseButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">License: <span class="licenses">' + $("#license").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete License</button>';
            newLink += '<br>License URL: <span class="licenseUrls">' + $("#licenseUrl").val() + '</span></div>';
            $("#licenses").html($("#licenses").html() + newLink);
            id++;

            $("#license").val("");
            $("#licenseUrl").val("");
        }
    );


    $("#authorButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Author Name: <span class="authorNames">' + $("#authorName").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Author</button>';
            newLink += '<br>Author Email: <span class=authorEmails>' + $("#authorEmail").val() + '</span></div>';
            $("#authors").html($("#authors").html() + newLink);
            id++;
            $("#authorName").val("");
        }
    );

    $("#instituteButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Institute: <span class="institutes">' + $("#institute").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Institute</button></div>';
            $("#institutes").html($("#institutes").html() + newLink);
            id++;
            $("#institute").val("");
        }
    );

    $("#fundingButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Funder: <span class="fundings">' + $("#funding").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Funder</button></div>';
            $("#fundings").html($("#fundings").html() + newLink);
            id++;
            $("#funding").val("");
        }
    );

    $("#downstreamButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Downstream Tool: <span class="downstreamTools">' + $("#downstream").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Downstream Tool</button></div>';
            $("#downstreams").html($("#downstreams").html() + newLink);
            id++;
            $("#downstream").val("");
        }
    );

    $("#upstreamButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Upstream Tool: <span class="upstreamTools">' + $("#upstream").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Upstream Tool</button></div>';
            $("#upstreams").html($("#upstreams").html() + newLink);
            id++;
            $("#upstream").val("");
        }
    );

    $("#dependencyButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Dependency: <span class="dependencies">' + $("#dependency").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Dependency</button></div>';
            $("#dependencies").html($("#dependencies").html() + newLink);
            id++;
            $("#dependency").val("");
        }
    );

    $("#tagButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Tag: <span class="tags">' + $("#tag").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Tag</button></div>';
            $("#tags").html($("#tags").html() + newLink);
            id++;
            $("#tag").val("");
        }
    );

    $("#maintainerButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; position:relative; padding:10px;" id="div' + tempid + '">Maintainer: <span class="maintainers">' + $("#maintainer").val() + '</span>';
            newLink += '<button style ="position: absolute;right: 10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Maintainer</button>';
            newLink += '<br>Maintainer Email: <span class=maintainerEmails>' + $("#maintainerEmail").val() + '</span></div>';
            $("#maintainers").html($("#maintainers").html() + newLink);
            id++;
            $("#maintainer").val("");
            $("#maintainerEmail").val("");
        }
    );
    //START EXTRA
    $("#softwareTypeButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Software Type: <span class="softwareTypes">' + $("#softwareType").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Software Type</button></div>';
            $("#softwareTypes").html($("#softwareTypes").html() + newLink);
            id++;
            $("#softwareType").val("");
        }
    );
    $("#domainButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Biological Domain: <span class="domains">' + $("#domain").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Biological Domain</button></div>';
            $("#domains").html($("#domains").html() + newLink);
            id++;
            $("#domain").val("");
        }
    );
    $("#platformButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Platform: <span class="platforms">' + $("#platform").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Platform</button></div>';
            $("#platforms").html($("#platforms").html() + newLink);
            id++;
            $("#platform").val("");
        }
    );
    $("#inputTypeButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Input Type: <span class="inputTypes">' + $("#inputType").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Input Type</button></div>';
            $("#inputTypes").html($("#inputTypes").html() + newLink);
            id++;
            $("#inputType").val("");
        }
    );
    $("#outputTypeButton").click(function () {
            var tempid = id;
            var newLink = '<div class="panel panel-default" style="position:relative; padding:10px;" id="div' + tempid + '">Output Type: <span class="outputTypes">' + $("#outputType").val() + '</span>';
            newLink += '<button style="position:absolute; right:10px;" onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Output Type</button></div>';
            $("#outputTypes").html($("#outputTypes").html() + newLink);
            id++;
            $("#outputType").val("");
        }
    );
    //END EXTRA



    $('#form').submit(function () {

        var send = {};
        send.name = $("#name").val();
        send.logo = $("#logo").val();
        send.description = $("#description").val();
        send.sourceCodeURL = $("#sourceCodeURL").val();
        send.publicationDOI = $("#publicationDOI").val();
        send.toolDOI = $("#toolDOI").val();
        send.language = $("#language").val();
        send.versionNum = $("#versionNum").val();
        send.versionDate = $("#versionDate").val();
        send.prevVersion = $("#prevVersion").val();
        send.nextVersion = $("#nextVersion").val();

        //var typeArr = new Array();
        //var typeVals = $(".types");
        //for(i = 0; i < typeVals.length; i++){
        //    if(typeVals[i].checked){
        //        typeArr.push(typeVals[i].value);
        //    }
        //}
        //send.types = typeArr;
        //
        //var domainArr = new Array();
        //var domainVals = $(".domains");
        //for(i = 0; i < domainVals.length; i++){
        //    if(domainVals[i].checked){
        //        domainArr.push(domainVals[i].value);
        //    }
        //}
        //send.domains = domainArr;
        //
        //var platformArr = new Array();
        //var platformVals = $(".platforms");
        //for(i = 0; i < platformVals.length; i++){
        //    if(platformVals[i].checked){
        //        platformArr.push(platformVals[i].value);
        //    }
        //}
        //send.platforms = platformArr;
        //
        //var inputFileArr = new Array();
        //var inputFileVals = $(".inputFiles");
        //for(i = 0; i < inputFileVals.length; i++){
        //    if(inputFileVals[i].checked){
        //        inputFileArr.push(inputFileVals[i].value);
        //    }
        //}
        //send.inputFiles = inputFileArr;
        //
        //var outputFileArr = new Array();
        //var outputFileVals = $(".outputFiles");
        //for(i = 0; i < outputFileVals.length; i++){
        //    if(outputFileVals[i].checked){
        //        outputFileArr.push(outputFileVals[i].value);
        //    }
        //}
        //send.outputFiles = outputFileArr;



        var linkDescs = $(".linkDescs");
        var linkURLs = $(".linkURLs");
        var authorNames = $(".authorNames");
        var authorEmails = $(".authorEmails");
        var institutes = $(".institutes");
        var fundings = $(".fundings");
        var upstreams = $(".upstreamTools");
        var downstreams = $(".downstreamTools");
        var dependencies = $(".dependencies");
        var tags = $(".tags");
        var maintainers = $(".maintainers");
        var maintainerEmails = $(".maintainerEmails");
        var licenses = $(".licenses");
        var licenseUrls = $(".licenseUrls");

        var inputDescs = [];
        var inputURLs = [];
        var inputAuthors = [];
        var inputAuthorEmails = [];
        var inputInstitutes = [];
        var inputFundings = [];
        var inputUpstreams = [];
        var inputDownstreams = [];
        var inputDependencies = [];
        var inputTags = [];
        var inputMaintainers = [];
        var inputMaintainerEmails = [];
        var inputLicenses = [];
        var inputLicenseUrls = [];

        for (i = 0; i < linkDescs.length; i++) {
            inputDescs.push(linkDescs[i].innerHTML.trim());
            inputURLs.push(linkURLs[i].innerHTML.trim());
        }

        for (i = 0; i < licenses.length; i++) {
            inputLicenses.push(licenses[i].innerHTML.trim());
            inputLicenseUrls.push(licenseUrls[i].innerHTML.trim());
        }

        for (i = 0; i < authorNames.length; i++) {
            inputAuthors.push(authorNames[i].innerHTML.trim());
            inputAuthorEmails.push(authorEmails[i].innerHTML.trim());
        }

        for (i = 0; i < institutes.length; i++) {
            inputInstitutes.push(institutes[i].innerHTML.trim());
        }

        for (i = 0; i < fundings.length; i++) {
            inputFundings.push(fundings[i].innerHTML.trim());
        }

        for (i = 0; i < upstreams.length; i++) {
            inputUpstreams.push(upstreams[i].innerHTML.trim());
        }

        for (i = 0; i < downstreams.length; i++) {
            inputDownstreams.push(downstreams[i].innerHTML.trim());
        }

        for (i = 0; i < dependencies.length; i++) {
            inputDependencies.push(dependencies[i].innerHTML.trim());
        }

        for (i = 0; i < tags.length; i++) {
            inputTags.push(tags[i].innerHTML.trim());
        }

        for (i = 0; i < maintainers.length; i++) {
            inputMaintainers.push(maintainers[i].innerHTML.trim());
            inputMaintainerEmails.push(maintainerEmails[i].innerHTML.trim());
        }

        //START EXTRA
        var softwareTypes = $(".softwareTypes");
        var domains = $(".domains");
        var platforms = $(".platforms");
        var inputTypes = $(".inputTypes");
        var outputTypes = $(".outputTypes");
        var inputSoftwareTypes = [];
        var inputDomains = [];
        var inputPlatforms = [];
        var inputInputTypes = [];
        var inputOutputTypes = [];

        for (i = 0; i < softwareTypes.length; i++) {
            inputSoftwareTypes.push(softwareTypes[i].innerHTML);
        }

        for (i = 0; i < domains.length; i++) {
            inputDomains.push(domains[i].innerHTML);
        }

        for (i = 0; i < platforms.length; i++) {
            inputPlatforms.push(platforms[i].innerHTML);
        }

        for (i = 0; i < inputTypes.length; i++) {
            inputInputTypes.push(inputTypes[i].innerHTML);
        }

        for (i = 0; i < outputTypes.length; i++) {
            inputOutputTypes.push(outputTypes[i].innerHTML);
        }

        send.types= inputSoftwareTypes;
        send.domains= inputDomains;
        send.platforms= inputPlatforms;
        send.inputFiles= inputInputTypes;
        send.outputFiles= inputOutputTypes;
        //END EXTRA
        send.linkDescriptions = inputDescs;
        send.linkUrls = inputURLs;
        send.authors = inputAuthors;
        send.authorEmails = inputAuthorEmails;
        send.institutions = inputInstitutes;
        send.funding = inputFundings;
        send.upstreams = inputUpstreams;
        send.downstreams = inputDownstreams;
        send.dependencies = inputDependencies;
        send.tags = inputTags;
        send.maintainers = inputMaintainers;
        send.maintainerEmails = inputMaintainerEmails;
        send.licenses = inputLicenses;
        send.licenseUrls = inputLicenseUrls;
        if(preset.id)
            send.id = preset.id;
        if(preset.source)
            send.source = preset.source;
        else
            send.source = "User Submission";

        $("#sendAddJson").val(JSON.stringify(send));

        return true; // return false to cancel form action
    });


    if(Object.keys(preset).length > 0){
        $("#title").html("Edit Resource: " + preset.id);
        if(preset.name){
            $("#name").val(preset.name);
        }
        if(preset.logo){
            $("#logo").val(preset.logo);
        }
        if(preset.description){
            $("#description").val(preset.description);
        }
        if(preset.sourceCodeURL){
            $("#sourceCodeURL").val(preset.sourceCodeURL);
        }
        if(preset.publicationDOI){
            $("#publicationDOI").val(preset.publicationDOI);
        }
        if(preset.toolDOI){
            $("#toolDOI").val(preset.toolDOI);
        }
        if(preset.language){
            $("#language").val(preset.language);
        }
        if(preset.versionNum){
            $("#versionNum").val(preset.versionNum);
        }
        if(preset.versionDate){
            $("#versionDate").val(preset.versionDate);
        }
        if(preset.prevVersion){
            $("#prevVersion").val(preset.prevVersion);
        }
        if(preset.nextVersion){
            $("#nextVersion").val(preset.nextVersion);
        }

        for (var i in preset.linkDescriptions) {
            $("#linkDesc").val(preset.linkDescriptions[i]);
            $("#linkURL").val(preset.linkUrls[i]);
            $("#linkButton").click();
        }

        for (var i in preset.licenses) {
            $("#license").val(preset.licenses[i]);
            $("#licenseUrl").val(preset.licenseUrls[i]);
            $("#licenseButton").click();
        }

        for (var i in preset.types) {
            $("#softwareType").val(preset.types[i]);
            $("#softwareTypeButton").click();
        }

        for (var i in preset.domains) {
            $("#domain").val(preset.domains[i]);
            $("#domainButton").click();
        }

        for (var i in preset.authors) {
            $("#authorName").val(preset.authors[i]);
            $("#authorEmail").val(preset.authorEmails[i])
            $("#authorButton").click();
        }

        for (var i in preset.institutions) {
            $("#institute").val(preset.institutions[i]);
            $("#instituteButton").click();
        }

        for (var i in preset.funding) {
            $("#funding").val(preset.funding[i]);
            $("#fundingButton").click();
        }

        for (var i in preset.platforms) {
            $("#platform").val(preset.platforms[i]);
            $("#platformButton").click();
        }

        for (var i in preset.inputFiles) {
            $("#inputType").val(preset.inputFiles[i]);
            $("#inputTypeButton").click();
        }

        for (var i in preset.outputFiles) {
            $("#outputType").val(preset.outputFiles[i]);
            $("#outputTypeButton").click();
        }

        for (var i in preset.upstreams) {
            $("#downstream").val(preset.upstreams[i]);
            $("#downstreamButton").click();
        }

        for (var i in preset.downstreams) {
            $("#upstream").val(preset.downstreams[i]);
            $("#upstreamButton").click();
        }

        for (var i in preset.dependencies) {
            $("#dependency").val(preset.dependencies[i]);
            $("#dependencyButton").click();
        }

        for (var i in preset.tags) {
            $("#tag").val(preset.tags[i]);
            $("#tagButton").click();
        }

        for (var i in preset.maintainers) {
            $("#maintainer").val(preset.maintainers[i]);
            $("#maintainerEmail").val(preset.maintainerEmails[i])
            $("#maintainerButton").click();
        }
    }

}

function removeElement(elementID) {
    re = '#' + $(elementID).attr("id");
    $(re).remove();
}