/* 01_biocatalogue_retrieval.js
 * This javascript retrieve web services from biocatalogue
 * It writes the json to file 01_biocatelogue_services.json
 *
 * Output: 01_biocatelogue_services.json
 * Author: Chelsea Ju
 * Update: 2015-08-16
 */


var request = require("request");
var url = "http://www.biocatalogue.org/";

var fs = require("fs");
var outfile = "resources/01_biocatalogue_services.json";
var data = [];


// retrieve the first page
request(
	{url : url + "/services.json?per_page=100",
	 json : true},
	function(error, response, body){
		if(!error && response.statusCode === 200){
			var pages = body["services"]["pages"];
			console.log("Pages: " + pages);
			var tool_count = 10 //body["services"]["total"]
			// retrieve all pages
			var retrieve_pages = function(i) {
				console.log("Page: " + i);
				request(
					{url : url + "/services.json?per_page=100&page=" + i,
					json: true},
					function(error2, response2, body2){
						if(!error2 && response2.statusCode === 200){
							var results = body2["services"]["results"];

							// retrieve resource page for tools
							var retrieve_tools = function(j) {
								console.log("Tool: " + j);
								var resource_url = results[j]["resource"];
								request(
									{url : resource_url + "/summary.json",
									json: true},
									function(error3, response3, body3){
										if("service" in body3){
											if(body3["service"]["name"] != "WeatherWS"){
												var service = {};

												service.name = body3["service"]["name"];
												var description = body3["service"]["description"];



												// if the description is too long, take only the first sentance.
												if(description && description.length > 1000){
													var new_desc = description.split(". ");
													service.description = new_desc[0];
//													var desc_re = new RegExp("(.*)[\r|\n|\.] ", "i");
//													var short_desc = description.match(desc_re)[0]; 												var short_desc = description.match(desc_re)[0];
//													service.description = short_desc;	
//													console.log(service.name + "::" + short_desc);												

												}
												else{
													service.description = description;
												}

												// logo
												service.logo = "https://www.biocatalogue.org/assets/logo_small-da549203f66b74dab67f592878053664.png";

												// sources
												service.source = "BioCatalogue";

												// language
												service.language = "HTML";

												// platform
												service.platforms = body3["service"]["service_technology_types"]

												// URLs
												service.sourceCodeURL = body3["service"]["summary"]["endpoints"][0]["endpoint"];
												service.linkDescriptions = ["Homepage", "Documentation"];
												service.linkUrls = [resource_url, body3["service"]["summary"]["documentation_urls"][0]];

												if(body3["service"]["summary"]["wsdls"]){
													service.linkDescriptions.push("WSDL");
													service.linkUrls.push(body3["service"]["summary"]["wsdls"][0]);
												}

												// publication
												var publication = body3["service"]["summary"]["publications"];
												if(publication.length > 0){
													var doi_re = new RegExp("(DOI: .*)\s*", "i");
													var publication_doi = publication[0].match(doi_re);

													if(publication_doi){
														service.publicationDOI = publication_doi[1];
													}
												}

												// institute
												service.institutions = [];
												var providers = body3["service"]["summary"]["providers"];
												for(var k = 0; k < providers.length; k++){
													var institute_re = new RegExp("institute", "i");
													var center_re = new RegExp("center", "i");

													if(providers[k].service_provider.name.match(institute_re) || providers[k].service_provider.name.match(center_re)){
														service.institutions.push(providers[k].service_provider.name);
													}
												}

												// licenses
												var licenses = body3["service"]["summary"]["licenses"];
												service.licenses = [];
												service.licenseUrls = [];
												for(var l =0; l < licenses.length; l++){
													if(!licenses[l].match(new RegExp("does not require","i"))){
														service.licenses.push(licenses[l]);
														service.licenseUrls.push("");
													}
												}

												// maintainers
												service.maintainers = [];
												service.maintainerEmails = [];
												var contacts = body3["service"]["summary"]["contacts"];
												for(var n = 0; n < contacts.length; n++){
													var email = contacts[n].match(new RegExp("(.*)\r\n(.*)", "i"));
													if(email){
														service.maintainers.push(email[2]);
														service.maintainerEmails.push(email[1]);
													}
													else{
														service.maintainers.push(contacts[n]);
														service.maintainerEmails.push("");
													}
												}
												
												// tool type
												service.types = ["Tool"];
												
												// tags
												service.tags = [];
												var tags = body3["service"]["summary"]["tags"];
												for(var t = 0; t < tags.length; t++){
													service.tags.push(tags[t].name);
												}

												// categories
												var categories = body3["service"]["summary"]["categories"];
												for(var c = 0; c < categories.length; c++){													
													service.tags.push(categories[c].name);
												}

												// biological domain and tool type
												var domain = {};
												for(var t2 = 0; t2 < service.tags.length; t2++){
													if(service.tags[t2] == "Data Retrieval"){
														service.types.push("Database");
													}


													if(service.tags[t2].match(new RegExp("epigenomic", "i"))){   
														domain["Epigenomics"] = "";
													}

													else if(service.tags[t2].match(new RegExp("metagenomic", "i")) || 
														service.tags[t2].match(new RegExp("metagenome", "i"))  
														){
														domain["Metagenomics"] = "";
													}

													else if (service.tags[t2].match(new RegExp("gene", "i")) || 
														service.tags[t2].match(new RegExp("genomic", "i")) || 
														service.tags[t2].match(new RegExp("genome", "i"))  ||
														service.tags[t2].match(new RegExp("dna", "i"))	||
														service.tags[t2].match(new RegExp("rna", "i")) ||
														service.tags[t2].match(new RegExp("nucleotide", "i"))
														){
														domain["Genomics"] = "";
													}

													if(service.tags[t2].match(new RegExp("protein", "i")) || 
														service.tags[t2].match(new RegExp("proteomic", "i")) || 
														service.tags[t2].match(new RegExp("proteome", "i")) ||  
														service.tags[t2].match(new RegExp("peptide", "i"))
														){
														domain["Proteomics"] = "";
													}

													if(service.tags[t2].match(new RegExp("metabolite", "i")) || 
														service.tags[t2].match(new RegExp("metabolomic", "i")) || 
														service.tags[t2].match(new RegExp("metabolome", "i"))  
														){
														domain["Metabolomics"] = "";
													}

													if(service.tags[t2].match(new RegExp("medical", "i")) || 
														service.tags[t2].match(new RegExp("biomedical", "i"))  
														){
														domain["Biomedical"] = "";
													}
												}

												// organize biological domain
												service.domains = [];
												for(var domain_key in domain){
													service.domains.push(domain_key);
												}

												// remove redundant keys from tags
												var proteomic_index = service.tags.indexOf("proteomics");
												var proteomics_index = service.tags.indexOf("proteomic");
												var genomic_index = service.tags.indexOf("genomic");
												var genomics_index = service.tags.indexOf("genomics");
												var metabolomic_index = service.tags.indexOf("metabolomic");
												var metabolomics_index = service.tags.indexOf("metabolomics");
												var metagenomic_index = service.tags.indexOf("metagenomic");
												var metagenomics_index = service.tags.indexOf("metagenomics");
												var epigenomic_index = service.tags.indexOf("epigenomic");
												var epigenomics_index = service.tags.indexOf("epigenomics");
												var biomedical_index = service.tags.indexOf("biomedical");

												if(proteomic_index >=0){
													service.tags.splice(proteomic_index, 1);
												}

												if(proteomics_index >=0){
													service.tags.splice(proteomics_index, 1);
												}

												if(genomic_index >=0){
													service.tags.splice(genomic_index, 1);
												}

												if(genomics_index >=0){
													service.tags.splice(genomics_index, 1);
												}

												if(metabolomic_index >=0){
													service.tags.splice( metabolomic_index, 1);
												}

												if(metabolomics_index >=0){
													service.tags.splice( metabolomics_index, 1);
												}

												if(metagenomic_index >=0){
													service.tags.splice( metagenomic_index, 1);
												}

												if(metagenomics_index >=0){
													service.tags.splice( metagenomics_index, 1);
												}

												if(biomedical_index >=0){
													service.tags.splice( biomedical_index, 1);
												}

												// write to file
												fs.appendFile(outfile, JSON.stringify(service) + ",\n", function(err){
																									if(err){
																										console.log(err);
																									}
																								}
												);
											}
										}
										
										// recursively call itself
										if (j < results.length - 1) { //results.length - 1
											retrieve_tools(j+1);
										}
										// retrieve a new page
										else {
											if (i < pages) {
												retrieve_pages(i+1);
											}
										}
									}
								)
							}
							retrieve_tools(0);
						}
					}	
				)
			}
			retrieve_pages(1);
		}
	}
);
