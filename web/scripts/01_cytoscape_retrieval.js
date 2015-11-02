/* 01_cytoscape_retrieval.js
 * This javascript retrieve web services from cytoscape
 * It writes the json to file 01_cytoscape_services.json
 *
 * Output: 01_cytoscape_services.json
 * Author: Chelsea Ju
 * Update: 2015-10-31
 *
 * Note - need to remove duplicate record from linux command:
 * 		sort 01_cytoscape_temp.json | uniq > 01_cytoscape_widgets.json
 * Note - this script is not stable, it may have different result sets at different runs
 */


var request = require("request");
var cheerio = require("cheerio");
var dateFormat = require('dateformat');
var url = "http://apps.cytoscape.org";

var fs = require("fs");
var outfile = "resources/01_cytoscape_temp.json";
var data = [];

request(
	{url : url + "/apps/wall",
	 json : true},
	function(error, response, body){
		if(!error && response.statusCode === 200){

			var $ = cheerio.load(body);
			var containers = cheerio.load($('table').html())('a');

			var retrieve_app = function(i){
				var app_link = containers[i]['attribs']['href']	 // getting the link of each app

				request(
					{url : url + app_link,json: true},
					function(error2, response2, body2){
						if(!error2 && response.statusCode === 200){

							var app = {}  // use this to store the app information

							var app_body2 = cheerio.load(body2) // parsing html
							var name_obj = app_body2('h2').attr('id','app-name')
							if(name_obj.length != 0)
							{			
								
								// getting name and logo information
								app.name  = name_obj.html().trim()	// app name
								app.description = name_obj.next().html()	// app description
								app.logo = url + cheerio.load(name_obj.parent().prev().html())('img').attr('src') // app logo
								app.source = "Cytoscape"
								app.types = ["Widget"]

								// links, maintainers publication  == check text first before parsing, use while loop
								var resource_obj = app_body2('li.nav-header')
								var next_resource_obj = resource_obj.next()
								app.linkDescriptions = ['Cytoscape Link']
								app.linkUrls = [url+app_link]
								app.maintainers = [];
								app.maintainerEmails = [];

								while(next_resource_obj.text() !== "" || next_resource_obj.hasClass('divider')){

									var subject = next_resource_obj.text().trim()

									if(subject === "Tutorial")
									{
										app.linkDescriptions.push("Tutorial")
										app.linkUrls.push(cheerio.load(next_resource_obj.html())('a').attr('href'))
									}
									else if (subject === "Cite this App")
									{
										var pubmed_url = cheerio.load(next_resource_obj.html())('a').attr('href').split("/")
										app.pubmed_id = pubmed_url[pubmed_url.length -1]
									}

									else if (subject === "Code Repository")
									{
										app.sourceCodeURL = cheerio.load(next_resource_obj.html())('a').attr('href')
									}
									else if (subject === "E-mail")
									{
										var help_contact = cheerio.load(next_resource_obj.html())('a').attr('href')
										app.maintainers.push(help_contact)
										app.maintainerEmails.push(help_contact)
									}
									else if(subject === "Website")
									{
										app.linkDescriptions.push("Website")
										app.linkUrls.push(cheerio.load(next_resource_obj.html())('a').attr('href'))
									}
									else if(subject === "Search posts")
									{
										app.linkDescriptions.push("Forum")
										app.linkUrls.push(cheerio.load(next_resource_obj.html())('a').attr('href'))
									}
									else if(subject === "Ask a question" || subject === ""){}

									else {
										console.log(subject, name)
									}

									next_resource_obj = next_resource_obj.next()
								}

								// version, release date, categories
								app.dependencies = []
								app.licenses = [];
								app.licenseUrls = [];
								var version_obj = cheerio.load(app_body2('div.well').html())('p').first()
								while(version_obj.text() != "")
								{
									var version_text = version_obj.text().trim()
									if(version_text.match(new RegExp("^Version", "i")))
										app.versionNum = version_text.substr(8)
									else if (version_text.match(new RegExp("^Released","i")))
										app.versionDate = dateFormat(version_text.substr(9), "yyyy-mm-dd")
									else if (version_text.match(new RegExp("^Works with","i")))
										 app.dependencies.push(version_text.substr(11))
									else if (version_text.match(new RegExp("^License", "i")))
									{
										var license_url = cheerio.load(version_obj.html())('a').attr('href')
										app.licenses.push(license_url)
										app.licenseUrls.push(license_url)
									}
									else if (version_text.match(new RegExp("Download", "i"))){}
									else
										console.log(version_text)
									version_obj= version_obj.next()
								}

								// authors, instituite, and  categories
								var author_obj = app_body2('div.tab-pane').attr('id','cy-app-details-tab').children().first()
								app.authors = []
								app.authorEmails = []
								var institutions = []
								app.tags = []

								while(author_obj.text() != "")
								{
									var author_text = author_obj.text().trim()
									if(author_text.match(new RegExp("Author")))
									{
										var author_list = cheerio.load(author_obj.html())('li').first()
										while(author_list.text() != "")
										{
											var info = author_list.text().split("(")
											var tmp_authors = info[0].trim().split(",")

											for(var c = 0; c < tmp_authors.length; c++)
											{
												app.authors.push(tmp_authors[c])
												app.authorEmails.push("")
											}

											// institution
											if(info[1])
												institutions.push(info[1].trim().slice(0,-1)) // need to remove duplicates!!!

											author_list = author_list.next()
										}
									}
									// categories are tags
									else if (author_text.match(new RegExp("Categories")))
									{
										var categories_list = cheerio.load(author_obj.html())('a').first()
										while(categories_list.text() != "")
										{
											app.tags.push(categories_list.text().trim())
											categories_list = categories_list.next()
										}
									}

									author_obj = author_obj.next()
								}
								
								
								// remove duplicates
								app.institutions = institutions.filter(function(item, pos) {
																			return institutions.indexOf(item) == pos;})

								// ad-hoc parsing biological domains
								var detail = app_body2('div#cy-app-details-md').text()
								app.domains = []

								if(detail.match(new RegExp("epigenomic", "i")))
									app.domains.push("Epigenomics")
								else if (detail.match(new RegExp("metagenom", "i")))
									app.domains.push("Metagenomics")
								else if (detail.match(new RegExp("gene", "i")) || 
										 detail.match(new RegExp("genom", "i")) ||
										 detail.match(new RegExp("dna", "i")) ||
										 detail.match(new RegExp("rna", "i")) ||
										 detail.match(new RegExp("nucleotide", "i")))

									app.domains.push("Genomics")

								if (detail.match(new RegExp("protein", "i")) || 
										 detail.match(new RegExp("proteom", "i")) ||
										 detail.match(new RegExp("peptide", "i")))

									app.domains.push("Proteomics")

								if (detail.match(new RegExp("metabolite", "i")) || 
										 detail.match(new RegExp("metabolom", "i")))
									app.domains.push("Metabolomics")

								if(detail.match(new RegExp("systems biology", "i")))
									app.domains.push("Systems Biology")

								if(detail.match(new RegExp("medical", "i")) || detail.match(new RegExp("biomedical", "i")))
									app.domains.push("Biomedical")

								// write to file
								fs.appendFile(outfile, JSON.stringify(app) + ",\n", function(err){
												if(err){
													console.log(err);
												}
											}
										);

							}

						}
					}
				)

				if(i+1 < containers.length)
					retrieve_app(i+1)

			}

			retrieve_app(0);

		}
	}
)
