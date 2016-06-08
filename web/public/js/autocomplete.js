
var suggestions = [];
BD2K.ready(function() {
    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                //  if (substrRegex.test(str)) {
                console.log("push: " + str);
                matches.push(str);
                //  }
            });

            cb(matches);
        };
    };

    $('#autocomplete .input-lg').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'resources',
            limit: 50,
            async: true,
            templates: {
                header: '<h3 class="header"><strong>Resources</strong></h3>'
            },
            source: function (query, processSync, processAsync) {
                query = query.split(" ");
                new_query = "";
                for(var i = 0; i < query.length; i++){
                    if(query[i].length == 0)
                    {
                        continue;
                    }
                    new_query += query[i]
                    if(i < query.length-1)
                    {
                        new_query += "+";
                    }
                }
                console.log("new_query: " + new_query);
                json_query = {};
                json_query["searchFilters"] = {};
                json_query["searchFilters"]["resource"] = new_query;
                json_query["searchFilters"]["searchType"] = "resources"
                return $.ajax({
                    url: "/resource/autocomplete",
                    type: "GET",
                    data: json_query,//"input=%7B\"searchFilters\"%3A%7B\"resource\"%3A\""+new_query+"\"%7D%7D",
                    success: function(data) {
                        console.log("data: " + data);
                        return processAsync(JSON.parse(data).slice(0,7));
                        // return data;
                    }
                });
            }
        },
        {
            name: 'tags',
            limit: 50,
            async: true,
            templates: {
                header: '<h3 class="header"><strong>Tags</strong></h3>'
            },
            source: function (query, processSync, processAsync) {
                query = query.split(" ");
                new_query = "";
                for(var i = 0; i < query.length; i++){
                    if(query[i].length == 0)
                    {
                        continue;
                    }
                    new_query += query[i]
                    if(i < query.length-1)
                    {
                        new_query += "+";
                    }
                }
                console.log("new_query: " + new_query);
                json_query = {};
                json_query["searchFilters"] = {};
                json_query["searchFilters"]["resource"] = new_query;
                json_query["searchFilters"]["searchType"] = "tags"
                return $.ajax({
                    url: "/resource/autocomplete",
                    type: "GET",
                    data: json_query,//"input=%7B\"searchFilters\"%3A%7B\"resource\"%3A\""+new_query+"\"%7D%7D",
                    success: function(data) {
                        console.log("data: " + data);
                        return processAsync(JSON.parse(data).slice(0,3));
                        // return data;
                    }
                });
            }
        });

});
