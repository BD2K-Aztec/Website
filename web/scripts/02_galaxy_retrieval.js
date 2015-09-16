
var infile = "resources/01_raw_galaxy_repositories.json";
var outfile = "resources/02_galaxy_repositories.json";
var fs = require('fs');

fs.readFile(infile, 'utf8', function (err, data) {
	if (err) throw err;
  	var repos = JSON.parse(data);

  	for (var i = 0; i < repos.length; i++){
  		var repo = repos[i];
  		var tags = repo.tags;
  		var description = repo.description;
  		repo.domains = [];

  		// biological domain
  		if(tags){
	  		if(tags.indexOf("Assembly") >=0 || 
	  			tags.indexOf("Combinatorial Selections") >= 0 ||
	  			tags.indexOf("Fastq Manipulation") >=0 ||
	  			tags.indexOf("Genome-Wide Association Study") >=0 ||
	  			tags.indexOf("Genomic Interval Operations") >=0 ||
	  			tags.indexOf("Micro-array Analysis") >=0 ||
	  			tags.indexOf("Next Gen Mappers") >=0 ||
	  			tags.indexOf("Phylogenetics") >=0 ||
	  			tags.indexOf("RNA") >=0 ||
	  			tags.indexOf("SAM") >=0 ||
	  			tags.indexOf("Transcriptomics") >=0 ||
	  			tags.indexOf("Variant Analysis") >=0 ||
	  			description.match(new RegExp("gene","i")) ||
	  			description.match(new RegExp("dna","i")) ||
	  			description.match(new RegExp("rna","i")) ||
	  			description.match(new RegExp("genom","i")) ||
	  			description.match(new RegExp("microarray","i"))
	  			)
	  		{
	  			repo.domains.push("Genomics");

	  		}

	  		if(tags.indexOf("Proteomics") >=0 ||
	  			description.match(new RegExp("peptide","i")) ||
	  			description.match(new RegExp("proteom","i")) ||
	  			description.match(new RegExp("protein","i"))
		  		)
	  		{
	  			repo.domains.push("Proteomics");
	  			tags.splice(tags.indexOf("Proteomics"),1);
	  		}

	  		if(tags.indexOf("Metabolomics") >=0 ||
	  			description.match(new RegExp("metabolite","i")) ||
	  			description.match(new RegExp("metabolom","i"))
		  		)
	  		{
	  			repo.domains.push("Metabolomics");
	  			tags.splice(tags.indexOf("Metabolomics"),1);
	  		}

	  		if(tags.indexOf("Metagenomics") >=0 ||
	  			description.match(new RegExp("microbiom","i")) ||
	  			description.match(new RegExp("metagenom","i"))
	  			)
	  		{
	  			repo.domains.push("Metagenomics");
	  			tags.splice(tags.indexOf("Metagenomics"),1);
	  		}

	  		if(tags.indexOf("Systems Biology") >=0){
	  			repo.domains.push("Systems Biology");
	  			tags.splice(tags.indexOf("Systems Biology"),1);
	  		}

			if( description.match(new RegExp("methylat","i")) ||
	  			description.match(new RegExp("epigenom","i")) ||
	  			description.match(new RegExp("histone","i"))
			){
				repo.domains.push("Epigenomics");
			}  
		}

		fs.appendFile(outfile, JSON.stringify(repo , null, 4) + ",\n", function(err){
			if (err){
				console.log(err);
			}
		});
  	}

});


