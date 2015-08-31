$(function() {
	id = 0;

	$("#filterButton").click(function() {
		tempid = id;
		newLink = '<div id="div' + tempid + '"> <br>Filter By: <p class="filtersBy">' + $("#filterSelect").val() + '</p>';
		newLink += 'Filter: <p class="filtersAdded">' + $("#searchFilter").val() + '</p>';
		newLink += '<button onclick="removeElement(div' + tempid + ')" type="button" class="btn btn-danger btn-xs" id="delete' + tempid + '">Delete Filter</button></div>';
		$("#filters").html($("#filters").html() + newLink);
		id++;
		$("#searchFilter").val("");
	});

	$('#form').submit(function() {
		filteredBy = $(".filtersBy");
		filtersText = $(".filtersAdded");

		inputTypes = [];
		inputFilters = [];

		for (i = 0; i < filteredBy.length; i++) {
			inputTypes.push(filteredBy[i].innerHTML.trim());
			inputFilters.push(filtersText[i].innerHTML.trim());
		}

        var parameters = {};
		parameters.inputTypes = inputTypes;
        parameters.inputFilters = inputFilters;

        //$.ajax({
        //    url : "/search-filters",
        //    type: "POST",
        //    data : parameters,
        //    success: function(data)
        //    {
        //        console.log(data.response);
        //        $("#sendJson").val(JSON.stringify(data.response));
        //        $("#submitForm").submit();
        //    },
        //    error: function (jqXHR, textStatus, errorThrown)
        //    {
        //        console.log(errorThrown);
        //    }
        //});

		$("#sendJson").val(JSON.stringify(parameters));
		$("#submitForm").submit();
		return false; // return false to cancel form action
	});


});

function removeElement(elementID) {
	re = '#' + $(elementID).attr("id");
	$(re).remove();
}
// $(".b")[0].value


//for types, domains have to populate dropdown