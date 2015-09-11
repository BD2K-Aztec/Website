/* 01_bioconductor_retrieval.js
 * This javascript retrieve web services from bioconductor.org
 * It writes the json to file 01_bioconductor_packages.json
 *
 * Output: 01_bioconductor_packages.json
 * Author: Chelsea Ju
 * Update: 2015-08-16
 */


var request = require("request");
//var sleep = require("sleep");
var version = "3.1";
var url = "http://bioconductor.org/packages/" +version+ "/bioc/VIEWS";

var fs = require("fs");
var outfile = "resources/01_bioconductor_packages.json";
var data = [];

request(
	{url : url,
	 json : true},
	function(error, response, body){
		if(!error && response.statusCode === 200){

			// split into individual packages
			var all_packages = body.split("\n\n");
			for(var i = 0; i < all_packages.length; i++){

				var pkg = {};
				pkg.linkDescriptions = [];
				pkg.linkUrls = [];
				pkg.platforms = [];
				pkg.domains = [];
				pkg.types = ["Tool"];
				pkg.language = "R";
				pkg.logo = "http://bioconductor.org/images/logo_bioconductor.gif";
				pkg.source = "BioConductor";

				var authorsTxt = "";
				var maintainersTxt = "";
				var dependencies = "";
				var licenses = "";
				var tags = "";

				var package_info = all_packages[i].split("\n");

				// iterate through each line
				var attribute_key = "";
				for(var k = 0; k < package_info.length; k++){
					var detail = package_info[k].match(new RegExp("(.*): (.*)", "i"));

					// name
					if(package_info[k].match(new RegExp("^Package:*", "i"))){
						attribute_key = "name";
						pkg.name = package_info[k].match(new RegExp("^Package:* (.*)", "i"))[1];

						// homepage url
						pkg.linkDescriptions.push("homepage");
						pkg.linkUrls.push("http://bioconductor.org/packages/release/bioc/html/" + pkg.name + ".html");
					}

					// version number
					else if(package_info[k].match(new RegExp("^Version:*", "i"))){
						attribute_key = "versionNum";
						pkg.versionNum = package_info[k].match(new RegExp("^Version:* (.*)", "i"))[1];
					}

					// dependency
					else if(package_info[k].match(new RegExp("^Depends:* (.*)", "i"))){
						attribute_key = "dependencies";
						dependencies += package_info[k].match(new RegExp("^Depends:* (.*)", "i"))[1];
					}

					else if(package_info[k].match(new RegExp("^SystemRequirements:* (.*)", "i"))){
						attribute_key = "dependencies";
						dependencies += package_info[k].match(new RegExp("^SystemRequirements:* (.*)", "i"))[1];
					}

					else if(package_info[k].match(new RegExp("^Depends:*", "")) || package_info[k].match(new RegExp("^SystemRequirements:*", "i"))){
						attribute_key = "dependencies";
					}

					// license
					else if(package_info[k].match(new RegExp("^License:* (.*)", "i"))){
						attribute_key = "licenses";
						licenses += package_info[k].match(new RegExp("^License:* (.*)", "i"))[1];
					}

					else if(package_info[k].match(new RegExp("^License:*", "i"))){
						attribute_key = "licenses";
					}

					// description
					else if(package_info[k].match(new RegExp("^Description:* (.*)", "i"))){
						attribute_key = "description";
						pkg.description = package_info[k].match(new RegExp("^Description:* (.*)", "i"))[1];
					}

					else if(package_info[k].match(new RegExp("^Description:*", "i"))){
						attribute_key = "description";
					}

					// tags
					else if(package_info[k].match(new RegExp("^biocViews:* (.*)", "i"))){
						attribute_key = "tags";
						tags += package_info[k].match(new RegExp("^biocViews:* (.*)", "i"))[1];
					}

					else if(package_info[k].match(new RegExp("^biocViews:*", "i"))){
						attribute_key = "tags";
					}

					// authors
					else if(package_info[k].match(new RegExp("^Author:*", "i"))){
						attribute_key = "authors";
						authorsTxt += package_info[k].match(new RegExp("^Author:* (.*)", "i"))[1];
					}

					// Maintainer
					else if(package_info[k].match(new RegExp("^Maintainer:*", "i"))){
						attribute_key = "maintainers";
						maintainersTxt += package_info[k].match(new RegExp("^Maintainer:* (.*)", "i"))[1];
					}

					// Source Code
					else if(package_info[k].match(new RegExp("^source\.ver:*", "i"))){
						attribute_key = "sourceCodeURL";
						pkg.sourceCodeURL = "http://bioconductor.org/packages/release/bioc/" +  package_info[k].match(new RegExp("^source\.ver:* (.*)", "i"))[1];
						pkg.platforms.push("Linux (Unix)");
					}

					// platform
					else if(package_info[k].match(new RegExp("^win\.binary\.ver", "i"))){
						attribute_key = "platforms";
						pkg.platforms.push("Windows 32");
					}

					else if(package_info[k].match(new RegExp("^win64\.binary\.ver", "i"))){
						attribute_key = "platforms";
						pkg.platforms.push("Windows 64");
					}

					else if(package_info[k].match(new RegExp("^mac\.binary\.ver", "i"))){
						attribute_key = "platforms";
						pkg.platforms.push("Mac OS X 10.6");
					}

					else if(package_info[k].match(new RegExp("^mac\.binary\.mavericks\.ver", "i"))){
						attribute_key = "platforms";
						pkg.platforms.push("Mac OS X 10.9");
					}

					// documentation
					else if(package_info[k].match(new RegExp("^vignettes:* (.*)", "i"))){
						attribute_key = "documentation";
						pkg.linkDescriptions.push("documentation");
						pkg.linkUrls.push("http://bioconductor.org/packages/release/bioc/" + package_info[k].match(new RegExp("^vignettes:* (.*)", "i"))[1]);
					}

					else if(package_info[k].match(new RegExp("^BugReports:* (.*)", "i"))){
						attribute_key = "documentation";
						pkg.linkDescriptions.push("bug");
						pkg.linkUrls.push(package_info[k].match(new RegExp("^BugReports:* (.*)", "i"))[1]);
					}

					else if(package_info[k].match(new RegExp("^vignettes:*", "i")) || package_info[k].match(new RegExp("^BugReports:*", "i"))){
						attribute_key = "documentation";
					}

					else if(package_info[k].match(new RegExp("^vignettes:", "i"))){
						attribute_key = "documentation";
					}

					// video
					else if(package_info[k].match(new RegExp("^Video:* (.*)", "i"))){
						attribute_key = "video";
						pkg.linkDescriptions.push("video");
						pkg.linkUrls.push(package_info[k].match(new RegExp("^Video:* (.*)", "i"))[1]);
					}
					else if(package_info[k].match(new RegExp("^Video:*", "i"))){
						attribute_key = "video";
					}


					// handle cases where we don't do anything about it
					else if(package_info[k].match(new RegExp("^Suggests:*", "i")) || 
							package_info[k].match(new RegExp("^MD5sum:*", "i")) ||
							package_info[k].match(new RegExp("^Archs:*", "i")) ||
							package_info[k].match(new RegExp("^NeedsCompilation:*", "i")) ||
							package_info[k].match(new RegExp("^Title:*", "i")) ||
							package_info[k].match(new RegExp("^vignetteTitles:*", "i")) ||
							package_info[k].match(new RegExp("^hasREADME:*", "i")) ||
							package_info[k].match(new RegExp("^hasNEWS:*", "i")) ||
							package_info[k].match(new RegExp("^hasINSTALL:*", "i")) ||
							package_info[k].match(new RegExp("^hasLICENSE:*", "i")) ||
							package_info[k].match(new RegExp("^Rfiles:*", "i")) ||
							package_info[k].match(new RegExp("^VignetteBuilder:*", "i")) ||
							package_info[k].match(new RegExp("^dependsOnMe:*:q", "i")) ||
							package_info[k].match(new RegExp("^importsMe:*", "i")) ||
							package_info[k].match(new RegExp("^suggestsMe:*", "i")) ||
							package_info[k].match(new RegExp("^Imports:*", "i")) ||
							package_info[k].match(new RegExp("^LinkingTo:*", "i")) ||
							package_info[k].match(new RegExp("^URL:*", "i")) ||
							package_info[k].match(new RegExp("^htmlTitles:*", "i")) ||
							package_info[k].match(new RegExp("^htmlDocs:*", "i")) ||
							package_info[k].match(new RegExp("^License_restricts_use:*", "i")) ||
							package_info[k].match(new RegExp("^OS_type:*", "i")) ||
							package_info[k].match(new RegExp("^Enhances:*", "i"))

					){
							attribute_key = "reset";
					}

					// filling the rest of the info
					else {
						var info = package_info[k].trim();

						if(attribute_key === "dependencies"){
							dependencies += " " + info;
						}
						else if (attribute_key === "licenses"){
							licenses  += " " + info;
						}
						else if (attribute_key === "description"){
							pkg.description += " " + info;
						}
						else if (attribute_key === "tags"){
							tags  += " " + info;
						}
						else if (attribute_key === "authors"){
							authorsTxt  += " " + info;
						}
						else if (attribute_key === "maintainers"){
							maintainersTxt  += " " + info;
						}

						else if(attribute_key === "documentation"){
							info = info.split(",")[0];
							if(info.match(new RegExp("^vignettes"))){
								pkg.linkDescriptions.push("documentation");
								pkg.linkUrls.push("http://bioconductor.org/packages/release/bioc/" + info);
							}
							attribute_key = "reset";
						}

						else if(attribute_key === "video"){
							pkg.linkDescriptions.push("video");
							pkg.linkUrls.push(info);
							attribute_key = "reset";
						}

//						console.log(package_info[k]);
//						pkg[attribute_key] += package_info[k].trim();
					}

				}

				// putting everything together
				pkg.dependencies = dependencies.split(",");
				pkg.licenses = licenses.split(", ");
				pkg.licenseUrls = [];
				for(var l = 0; l < pkg.licenses.length; l++ ){
					pkg.licenseUrls.push("");
				}
				pkg.tags = tags.split(", ");

				// authors
				pkg.authors = [];
				pkg.authorEmails = [];
				var authors_info = authorsTxt.split(/, | and |; |,|>/);
				for(var au = 0; au < authors_info.length; au++){
					var author_with_emails = authors_info[au].match(new RegExp("([A-Z].*) (<.*@.*)"));
					var author_wo_emails = authors_info[au].match(new RegExp("([A-Z].*)([A-Z].*)"));

					if(author_with_emails){
						pkg.authors.push(author_with_emails[1]);
						pkg.authorEmails.push(author_with_emails[2]+">");
					}
					else if (author_wo_emails){
						pkg.authors.push(author_wo_emails[1] + author_wo_emails[2]);
						pkg.authorEmails.push("");
					}
				}

				// mainteners
				pkg.maintainers = [];
				pkg.maintainerEmails = [];
				var maintainer_info = maintainersTxt.split(/, | and |; |,|>/);
				for(var ma = 0; ma < maintainer_info.length; ma++){
					var maintainer_with_emails = maintainer_info[ma].match(new RegExp("([A-Z].*) *(<.*@.*)"));
					var maintainer_wo_emails = maintainer_info[ma].match(new RegExp("([A-Z].*)([A-Z].*)"));

					if(maintainer_with_emails){
						pkg.maintainers.push(maintainer_with_emails[1]);
						pkg.maintainerEmails.push(maintainer_with_emails[2]+">");
					}
					else if (maintainer_wo_emails){
						pkg.maintainers.push(maintainer_wo_emails[1] + maintainer_wo_emails[2]);
						pkg.maintainerEmails.push("");
					}
				}



				// biological domain
				if(tags.match(new RegExp("gene","i")) || 
					tags.match(new RegExp("dna","i")) || 
					tags.match(new RegExp("rna","i")) || 
					tags.match(new RegExp("genome","i")) ||
					tags.match(new RegExp("genomic", "i")) ||
					tags.match(new RegExp("microarray", "i")))
				{
					pkg.domains.push("Genomics");
				}

				if(tags.match(new RegExp("peptide","i")) || 
					tags.match(new RegExp("protein","i")) || 
					tags.match(new RegExp("proteome","i")) ||
					tags.match(new RegExp("proteomic", "i")))
				{
					pkg.domains.push("Proteomics");
				}

				if(tags.match(new RegExp("metabolite","i")) || 
					tags.match(new RegExp("metabolomic","i")) ||
					tags.match(new RegExp("metabolome", "i")))
				{
					pkg.domains.push("Metabolomics");
				}

				if(tags.match(new RegExp("methylation","i")) || 
					tags.match(new RegExp("epigenomic","i")) ||
					tags.match(new RegExp("epigenome", "i")) ||
					(pkg.description && ( pkg.description.match(new RegExp("epigenom", "i")) ||
					pkg.description.match(new RegExp("histone", "i")))))
				{
					pkg.domains.push("Epigenomics");
				}

				if(tags.match(new RegExp("microbiome","i")) || 
					tags.match(new RegExp("metagenom","i")) ||
					(pkg.description && (pkg.description.match(new RegExp("metagenom", "i")) ||
					pkg.description.match(new RegExp("histone", "i")))))
				{
					pkg.domains.push("Metagenomics");
				}


				// remove tags
				var proteomic_index = pkg.tags.indexOf("proteomics");
				var proteomics_index = pkg.tags.indexOf("proteomic");
				var genomic_index = pkg.tags.indexOf("genomic");
				var genomics_index = pkg.tags.indexOf("genomics");
				var metabolomic_index = pkg.tags.indexOf("metabolomic");
				var metabolomics_index = pkg.tags.indexOf("metabolomics");
				var metagenomic_index = pkg.tags.indexOf("metagenomic");
				var metagenomics_index = pkg.tags.indexOf("metagenomics");
				var biomedical_index = pkg.tags.indexOf("biomedical");

				if(proteomic_index >=0){
					pkg.tags.splice(proteomic_index, 1);
				}

				if(proteomics_index >=0){
					pkg.tags.splice(proteomics_index, 1);
				}

				if(genomic_index >=0){
					pkg.tags.splice(genomic_index, 1);
				}

				if(genomics_index >=0){
					pkg.tags.splice(genomics_index, 1);
				}

				if(metabolomic_index >=0){
					pkg.tags.splice( metabolomic_index, 1);
				}

				if(metabolomics_index >=0){
					pkg.tags.splice( metabolomics_index, 1);
				}

				if(metagenomic_index >=0){
					pkg.tags.splice( metagenomic_index, 1);
				}

				if(metagenomics_index >=0){
					pkg.tags.splice( metagenomics_index, 1);
				}

				if(biomedical_index >=0){
					pkg.tags.splice( biomedical_index, 1);
				}

				// append to file 
				if(pkg.name){
					fs.appendFile(outfile, JSON.stringify(pkg) +",\n", function(err){
						if(err){
							console.log(err);
						}
					});
				}              	
			}

		}
	}
)

