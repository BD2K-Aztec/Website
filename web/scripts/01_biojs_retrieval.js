/* 01_biojs_retrieval.js
 * This javascript retrieve packages from npm that contains biojs as keyword
 * It uses 'npm-keyword' to retrieve all packages that contain 'biojs' in keyword
 * Then uses package-json to retrieve package info in json format
 * Last, it writes the json to file 01_raw_biojs_packages.json
 *
 * Output: 01_raw_biojs_packages.json
 * Author: Chelsea Ju
 * Update: 2015-08-15
 */

// load packages
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');
var fs = require('fs');

// output file
var data = [];
var outfile = 'resources/01_biojs_packages.json';


// retrieve biojs packages
npmKeyword('biojs', function (err, biojs_pkg) {

	console.log(biojs_pkg.length);
	for(var i = 0; i < biojs_pkg.length; i++){
		var pkg_name = biojs_pkg[i]['name'];

		// retrieve json format
		packageJson(pkg_name, 'latest', function (err, pkg_json) {
			var pkg = {};
			pkg.name = pkg_json.name;
			pkg.versionNum = pkg_json.version;
			pkg.description = pkg_json.description;

			if("author" in pkg_json){
				pkg.authors= [pkg_json.author.name];
				pkg.authorEmails = [pkg_json.author.email];
			}
			pkg.tags = pkg_json.keywords;
			pkg.sourceCodeURL = pkg_json.repository.url;
			pkg.linkDescriptions = ["Homepage", "Documentation", "Bugs"];
			pkg.linkUrls = ["https://www.npmjs.com/package/" + pkg_json.name, pkg_json.homepage, pkg_json.bugs.url];
			pkg.types = ["Widget"];
			pkg.platforms = ["Web UI"];
			pkg.language = "JavaScript";
			pkg.logo = "http://biojs.net/img/logo.png";

			pkg.licenses = [];
			pkg.licenseUrls = [];
			for(var l =0; l < pkg_json.licenses; l++){
				pkg.licenses.push(pkg_json.licenses[l].type);
				pkg.licenseUrls.push(pkg_json.licenses[l].url);

			}

			pkg.dependencies = [];
			for(var k in pkg_json.dependencies){
				pkg.dependencies.push(k + ": " + pkg_json.dependencies[k]);
			}

			pkg.maintainers = [];
			pkg.maintainerEmails = [];

			for(var j = 0; j < pkg_json.maintainers.length; j++){
				pkg.maintainers.push(pkg_json.maintainers[j].name);
				pkg.maintainerEmails.push(pkg_json.maintainers[j].email);
			}			

			pkg.source = "Biojs";
			pkg.tags = [];
			pkg.domains = [];

			var keywords = pkg_json.keywords;
			// hacky way to match biological domain
			if(keywords.indexOf("Medical") >= 0){
				console.log(pkg_json);
			}

			if(keywords.indexOf("proteome") >= 0 || keywords.indexOf("proteomics") >=0 || keywords.indexOf("proteomic") >=0 || keywords.indexOf("protein") >=0 || keywords.indexOf("proteins") >=0){
				pkg.domains.push("Proteomics");
			}

			if(keywords.indexOf("genome") >= 0 || keywords.indexOf("genomic") >=0 || keywords.indexOf("genomics") >=0 || keywords.indexOf("genes") >=0 || keywords.indexOf("dna") >=0 || keywords.indexOf("rna") >=0 || keywords.indexOf("plasmid") >=0 || keywords.indexOf("rna-seq") >=0){
				pkg.domains.push("Genomics");
			}

			if(keywords.indexOf("metabolome") >= 0 || keywords.indexOf("metabolomic") >=0 || keywords.indexOf("metabolomics") >=0 || keywords.indexOf("metabolite") >=0 || keywords.indexOf("metabolites") >=0){
				pkg.domains.push("Metabolomics");
			}

			if(keywords.indexOf("metagenomic") >= 0 || keywords.indexOf("metagenomics") >= 0){
				pkg.domains.push("Metagenomics");
			}

			if(keywords.indexOf("Medical") >= 0 || keywords.indexOf("biomedical") >= 0){
				pkg.domains.push("Biomedical");
			}

			// remove certain keywords 
			var biojs_index = keywords.indexOf("biojs");
			var proteomic_index = keywords.indexOf("proteomics");
			var proteomics_index = keywords.indexOf("proteomic");
			var genomic_index = keywords.indexOf("genomic");
			var genomics_index = keywords.indexOf("genomics");
			var metabolomic_index = keywords.indexOf("metabolomic");
			var metabolomics_index = keywords.indexOf("metabolomics");
			var metagenomic_index = keywords.indexOf("metagenomic");
			var metagenomics_index = keywords.indexOf("metagenomics");
			var biomedical_index = keywords.indexOf("biomedical");

			if(biojs_index >=0){
				keywords.splice(biojs_index, 1);
			}

			if(proteomic_index >=0){
				keywords.splice(proteomic_index, 1);
			}

			if(proteomics_index >=0){
				keywords.splice(proteomics_index, 1);
			}

			if(genomic_index >=0){
				keywords.splice(genomic_index, 1);
			}

			if(genomics_index >=0){
				keywords.splice(genomics_index, 1);
			}

			if(metabolomic_index >=0){
				keywords.splice( metabolomic_index, 1);
			}

			if(metabolomics_index >=0){
				keywords.splice( metabolomics_index, 1);
			}

			if(metagenomic_index >=0){
				keywords.splice( metagenomic_index, 1);
			}

			if(metagenomics_index >=0){
				keywords.splice( metagenomics_index, 1);
			}

			if(biomedical_index >=0){
				keywords.splice( biomedical_index, 1);
			}


			pkg.tags = keywords;

/*			if(i == biojs_pkg.length - 1){
				// append to file
				fs.appendFile(outfile, JSON.stringify(data), function(err){
					console.log("File written to " + outfile)
					if(err){						
						console.log(err);
					}
				})
			}
*/

			// append to file                	
			fs.appendFile(outfile, JSON.stringify(pkg , null, 4) + ",\n", function(err){
				if (err){
					console.log(err);
				}
			});
	
			// separator
/*			fs.appendFile(outfile, ",\n", function(err){
				if (err){
					console.log(err);
				}
			});
*/
		});
	}
});