$(function() {
    var elem = document.querySelector('#aztec-malarkey');
    var opts = {
        typeSpeed: 100,
        deleteSpeed: 50,
        pauseDelay: 1500,
        loop: true,
        //postfix: ' BD2K'
    };
    malarkey(elem, opts).type('Genomics')   .pause().delete()
        .type('Proteomics').pause().delete()
        .type('Metabolomics').pause().delete()
        .type('Metagenomics').pause().delete()
        .type('Epigenomics').pause().delete()
        .type('Precision Med').pause().delete()
        .type('Innovation').pause().delete()
        .type('Technology').pause().delete()
        .type('Biology').pause().delete()
        .type('Imaging').pause().delete()
        .type('Bioinformatics').pause().delete();

    $('#submitForm').submit(function() {

        filtersText = $("#query").val();

        var filters = {};

        filters["resource"] = filtersText;

        var parameters = {};
        parameters.searchFilters = filters;

        $("#sendJson").val(JSON.stringify(parameters));
        //return false; // return false to cancel form action
    });

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
        //$("#submitTopForm").submit();
        //return false; // return false to cancel form action
    });
});
