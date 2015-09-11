var request = require("request");
var url = "https://toolshed.g2.bx.psu.edu/api/repositories"
//var url = "https://toolshed.g2.bx.psu.edu/repository/browse_repositories_in_category?id=3c4a991608b4c8dd"

var fs = require("fs");
var cheerio = require("cheerio");
var outfile = "resources/01_raw_galaxy_repositories.json";
var category_hash = {};
var results = "";

// retrieve the first page
request(
	{url : url,
	 json : true},
	function(error, response, body){
		if(!error && response.statusCode === 200){


			var retreive_galaxy = function(i){
				var repos = {};
				var id = body[i]["id"];
				repos.name = body[i]["name"];
				repos.description = body[i]["description"];
				repos.logo = "http://evomicsorg.wpengine.netdna-cdn.com/wp-content/uploads/2011/11/galaxy_logo.png";

				if(body[i]["remote_repository_url"] && body[i]["remote_repository_url"].match(new RegExp("(http.*)", "i"))){
					repos.sourceCodeURL = body[i]["remote_repository_url"].match(new RegExp("(http.*)", "i"))[1];
				}

				// URLs
				repos.linkDescriptions = ["Homepage"];
				repos.linkUrls = ["https://toolshed.g2.bx.psu.edu/repository?repository_id=" + id];

				// authors
				repos.authors = [body[i]['owner']];
				repos.authorEmails = [""];

				// maintener
				repos.maintainers = [body[i]['owner']];
				repos.maintainerEmails = [""];

				// tool types
				repos.types = ["Tool"];

				// platform
				repos.platforms = ["Web UI", "Linux, Unix"];

				// tags
				var tags = body[i]["category_ids"];
				repos.tags = tags;
				for (var j = 0; j < tags.length; j++){
					category_hash[tags[j]] = "";
				}

				// retrieve dependencies and version
				request(
					{url : "https://toolshed.g2.bx.psu.edu/repository/view_repository?id=" + id ,
					 json : true
					},
					function(error2, response2, body2){
						if(!error2 && response2.statusCode === 200){
							var $ = cheerio.load(body2);

							console.log(i);
							repos.dependencies = [];
							// version and dependencies

							var dependencies_html = $('table');
							for(var d = 0; d < dependencies_html.length; d++){
								var table_id = cheerio.load(dependencies_html[d])('table').attr('id');
								if(table_id === "valid_tools"){
									repos.versionNum = cheerio.load(dependencies_html[d])('td').last().html();
								}

								else if(table_id === "tool_dependencies"){
									var tool_dep_details = cheerio.load(dependencies_html[d])('tr');
									for(var t = 2; t < tool_dep_details.length; t++){
										var tool_dep_details_td = cheerio.load(tool_dep_details[t])('td');
										repos.dependencies.push(cheerio.load(tool_dep_details_td[0])('td').html().trim() + ": " + 
																cheerio.load(tool_dep_details_td[1])('td').html().trim())
									}
								}

								else if(table_id === "repository_dependencies"){
									var repo_dep_details = cheerio.load(dependencies_html[d])('tr');
									for(var r = 1; r < repo_dep_details.length; r++){
										var repo_dep_details_b = cheerio.load(repo_dep_details[r])('b');
										var repo_dep_info = cheerio.load(repo_dep_details_b[0])('b').html();

										var repo_dep_info_match = /_\d+/.exec(repo_dep_info);
										if(repo_dep_info_match){
											var pkg_name = repo_dep_info.substring(0,repo_dep_info_match.index);
											var pkg_version = repo_dep_info.substring(repo_dep_info_match.index+1);
											repos.dependencies.push(pkg_name, pkg_name.replace("package_","") + ": " +
																	pkg_version.replace(new RegExp("_", "g"), "."));
										}
										else{
											repos.dependencies.push(repo_dep_info);
										}

									}
								}
							}
						}
					}
				)

				results += JSON.stringify(repos) + ",\n";

				// recursive call
				if(i + 1 < body.length){
					retreive_galaxy(i+1);
				}
			}

			retreive_galaxy(1);
			retrieve_category_name(0);
		}
	}
)

var retrieve_category_name = function(c){

	var cat_id = Object.keys(category_hash)[c];
	request(
		{	url : "https://toolshed.g2.bx.psu.edu/repository/browse_repositories_in_category?id=" + cat_id,
			json : true
		},
		function (error2, response2, body2){
			if(!error2 && response2.statusCode === 200){
				var re = new RegExp("<title>Repositories in Category (.*?)</title>", "i");
				var category_name = body2.match(re)[1];
				var re2 = new RegExp(cat_id,"g");
				results = results.replace(re2, category_name);

				// recursively calling itself until there is no more category id in the hash
				if(c < Object.keys(category_hash).length - 1){
					retrieve_category_name(c+1);
				}

				// write to file
				else{
					fs.writeFile(outfile, results,
						function(err){
							if(err) console.log(err);
						}
					)
				}
			}
		}
	)
	
}


/*
var retrieve_category_name = function(cat_array, repos_obj, cat_array_index){
	var cat_id = cat_array[cat_array_index];
	request(
		{url : "https://toolshed.g2.bx.psu.edu/repository/browse_repositories_in_category?id=" + cat_id,
		json : true
		},
		function (error2, response2, body2){
			if(!error2 && response2.statusCode === 200){
				var re = new RegExp("<title>Repositories in Category (.*?)</title>", "i");
				var category_name = body2.match(re)[1];

				if("categories" in repos_obj){
					repos_obj.categories.push(category_name);
				}
				else{
					repos_obj.categories = [category_name];
				}

				if(cat_array_index + 1 < cat_array.length){
					retrieve_category_name(cat_array, repos_obj, cat_array_index + 1);
				} 
				else{
					console.log(repos_obj);
					fs.appendFile(outfile, JSON.stringify(repos_obj) + ",\n", 
						function(err){
							if(err)	console.log(err);
						}
					)
				}
			}
		}
	)
}
*/
