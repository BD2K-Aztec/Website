DROP DATABASE IF EXISTS BD2K;
CREATE DATABASE BD2K;
USE BD2K;

CREATE TABLE Tools (ToolID INTEGER NOT NULL AUTO_INCREMENT, Name VARCHAR(40) NOT NULL, Logo VARCHAR(40) NULL, Description Text NULL, 
	SourceCode VARCHAR(100) NULL, PubMedID INTEGER NULL, SpecialReq Text NULL, VersionNumber VARCHAR(40), VersionDate VARCHAR(100), 
	PreviousVersion INTEGER NULL, NextVersion INTEGER NULL, License VARCHAR(100), Source VARCHAR(100) NOT NULL, 
	PRIMARY KEY (ToolID));
CREATE TABLE Links (ToolID INTEGER NOT NULL, LinkDescription VARCHAR(100) NOT NULL, Link VARCHAR(100) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE Types (TypeID INTEGER NOT NULL, Type VARCHAR(100) NOT NULL, PRIMARY KEY(TypeID));
-- CREATE TABLE ToolTypes (ToolID INTEGER NOT NULL, TypeID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(TypeID) REFERENCES Types(TypeID));
CREATE TABLE ToolTypes (ToolID INTEGER NOT NULL, Type VARCHAR(40) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE Authors (AuthorID INTEGER NOT NULL AUTO_INCREMENT, AuthorFirst VARCHAR(40), AuthorLast VARCHAR(40), PRIMARY KEY(AuthorID));
-- CREATE TABLE ToolAuthors (ToolID INTEGER NOT NULL, AuthorID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(AuthorID) REFERENCES Authors(AuthorID));
CREATE TABLE ToolAuthors (ToolID INTEGER NOT NULL, Author VARCHAR(75) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Institutes (ToolID INTEGER NOT NULL, Institution VARCHAR(100) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Fundings (ToolID INTEGER NOT NULL, Funding VARCHAR(100) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE BiologicalDomains(DomainID INTEGER NOT NULL, Type VARCHAR(100) NOT NULL, PRIMARY KEY(DomainID));
-- CREATE TABLE ToolDomains(ToolID INTEGER NOT NULL, DomainID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(DomainID) REFERENCES BiologicalDomains(DomainID));
CREATE TABLE ToolDomains(ToolID INTEGER NOT NULL, Domain VARCHAR(40) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE Platforms (PlatformID INTEGER NOT NULL, Platform VARCHAR(100) NOT NULL, PRIMARY KEY(PlatformID));
-- CREATE TABLE PlatformType (ToolID INTEGER NOT NULL, PlatformID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(PlatformID) REFERENCES Platforms(PlatformID));
CREATE TABLE PlatformType (ToolID INTEGER NOT NULL, PlatformType VARCHAR(40) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE UpstreamTools (ToolID INTEGER NOT NULL, UpstreamToolID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(UpstreamToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE Extends (ToolID INTEGER NOT NULL, ExtendedToolID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(ExtendedToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE Reimplements (ToolID INTEGER NOT NULL, ReimplementedToolID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(ReimplementedToolID) REFERENCES Tools(ToolID));
-- CREATE TABLE FileTypes (FileID INTEGER NOT NULL, Type VARCHAR(100) NOT NULL, Description VARCHAR(100), PRIMARY KEY(FileID));
-- CREATE TABLE ToolInputs (ToolID INTEGER NOT NULL, FileID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(FileID) REFERENCES FileTypes(FileID));
-- CREATE TABLE ToolOutputs (ToolID INTEGER NOT NULL, FileID INTEGER NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID), FOREIGN KEY(FileID) REFERENCES FileTypes(FileID));
CREATE TABLE ToolInputs (ToolID INTEGER NOT NULL, FileType VARCHAR(75) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE ToolOutputs (ToolID INTEGER NOT NULL, FileType VARCHAR(75) NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Comments(ToolID INTEGER NOT NULL, Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, Comment TEXT NOT NULL, FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Dependencies(ToolID INTEGER NOT NULL, Dependency VARCHAR(100), FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Tags(ToolID INTEGER NOT NULL, Tag VARCHAR(100), FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));
CREATE TABLE Maintainers(ToolID INTEGER NOT NULL, Maintainer VARCHAR(100), FOREIGN KEY(ToolID) REFERENCES Tools(ToolID));

-- INSERT INTO Types VALUES (1, "Imaging");
-- INSERT INTO Types VALUES (2, "Analysis");
-- INSERT INTO Types VALUES (3, "Modeling");
-- INSERT INTO Types VALUES (4, "Data");
-- INSERT INTO Types VALUES (5, "Visualization");
-- INSERT INTO Types VALUES (100, "Other");

-- INSERT INTO BiologicalDomains VALUES (1, "Genomics");
-- INSERT INTO BiologicalDomains VALUES (2, "Proteomics");
-- INSERT INTO BiologicalDomains VALUES (3, "Metabolomics");
-- INSERT INTO BiologicalDomains VALUES (4, "Metagenomics");
-- INSERT INTO BiologicalDomains VALUES (5, "Epigenomics");
-- INSERT INTO BiologicalDomains VALUES (6, "Wireless Health");
-- INSERT INTO BiologicalDomains VALUES (7, "Computational System Biology");
-- INSERT INTO BiologicalDomains VALUES (8, "Biomedical Imaging");
-- INSERT INTO BiologicalDomains VALUES (9, "Public Health Informatics");
-- INSERT INTO BiologicalDomains VALUES (100, "Other");

-- INSERT INTO FileTypes VALUES (1, ".txt", "text");
-- INSERT INTO FileTypes VALUES (2, ".fa", "fasta");
-- INSERT INTO FileTypes VALUES (3, ".fq", "fastq");
-- INSERT INTO FileTypes VALUES (4, ".fai", "fasta index");
-- INSERT INTO FileTypes VALUES (5, ".bam", "binary version of sam");
-- INSERT INTO FileTypes VALUES (6, ".sam", "sequence alignment");
-- INSERT INTO FileTypes VALUES (7, ".xml", "eXtensible markup language");
-- INSERT INTO FileTypes VALUES (8, ".vcf", "variant call format");
-- INSERT INTO FileTypes VALUES (9, ".GFF", "general feature format");
-- INSERT INTO FileTypes VALUES (10, ".GTF", "genearl feature transfer");
-- INSERT INTO FileTypes VALUES (11, ".PED", "SNP and genotype information");
-- INSERT INTO FileTypes VALUES (12, ".MAP", "SNPs information");
-- INSERT INTO FileTypes VALUES (13, ".tPED", "transposed fileset");
-- INSERT INTO FileTypes VALUES (14, ".FAM", "individual and family information");
-- INSERT INTO FileTypes VALUES (15, ".tFAM", "transposed fileset");
-- INSERT INTO FileTypes VALUES (16, ".LGEN", "genotypes");
-- INSERT INTO FileTypes VALUES (17, ".Set", "describe a set of files");

-- INSERT INTO Platforms VALUES (1, "Windows");
-- INSERT INTO Platforms VALUES (2, "OSX");
-- INSERT INTO Platforms VALUES (3, "Linux");
-- INSERT INTO Platforms VALUES (4, "Web");
-- INSERT INTO Platforms VALUES (5, "iOS");
-- INSERT INTO Platforms VALUES (6, "Android");

USE `BD2K`;
DROP procedure IF EXISTS `InsertTool`;

DELIMITER $$
USE `BD2K`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertTool`(IN name VARCHAR(40), IN logo VARCHAR(40), IN description Text, IN sourceCode VARCHAR(100), IN pubMedID INTEGER, 
IN specialReq Text, IN versionNumber VARCHAR(40), IN versionDate VARCHAR(100), IN previousVersion INTEGER, IN nextVersion INTEGER, 
IN license VARCHAR(100), IN source VARCHAR(100), IN linkDesc TEXT, IN linkUrl TEXT, IN types TEXT, IN authors TEXT, IN institutes TEXT, IN fundings TEXT, 
IN domains TEXT, IN platforms TEXT, IN inputFiles TEXT, IN outputFiles TEXT, IN dependencies TEXT, IN tags TEXT, IN maintainers VARCHAR(100))
BEGIN

INSERT INTO Tools (Name, Logo, Description, SourceCode, PubMedID, SpecialReq, VersionNumber, VersionDate, PreviousVersion, NextVersion, License, Source) 
	VALUES (name, logo, description, sourceCode, pubMedID, specialReq, versionNumber, versionDate, previousVersion, nextVersion, license, source);
SET @id = LAST_INSERT_ID();

WHILE (LOCATE('|||', linkDesc) > 0)
DO
	SET @LinkDescStr = SUBSTRING(linkDesc, 1, LOCATE('|||',linkDesc)-1);
	SET linkDesc = SUBSTRING(linkDesc, LOCATE('|||', linkDesc) + 3);
    
	SET @LinkUrlStr = SUBSTRING(linkUrl, 1, LOCATE('|||',linkUrl)-1);
	SET linkUrl = SUBSTRING(linkUrl, LOCATE('|||', linkUrl) + 3);

    INSERT INTO Links VALUES(@id, @LinkDescStr, @LinkUrlStr);
END WHILE;

WHILE (LOCATE('|||', types) > 0)
DO
	SET @TypeStr = SUBSTRING(types, 1, LOCATE('|||',types)-1);
	SET types = SUBSTRING(types, LOCATE('|||', types) + 3);

    INSERT INTO ToolTypes VALUES(@id, @TypeStr);
END WHILE;

WHILE (LOCATE('|||', authors) > 0)
DO
	SET @AuthorStr = SUBSTRING(authors, 1, LOCATE('|||',authors)-1);
	SET authors = SUBSTRING(authors, LOCATE('|||', authors) + 3);

    INSERT INTO ToolAuthors VALUES(@id, @AuthorStr);
END WHILE;

-- WHILE (LOCATE('|||', firsts) > 0)
-- DO
-- 	SET @Author = -1;
-- 	SET @FirstStr = SUBSTRING(firsts, 1, LOCATE('|||',firsts)-1);
-- 	SET firsts = SUBSTRING(firsts, LOCATE('|||', firsts) + 3);
    
-- 	SET @LastStr = SUBSTRING(lasts, 1, LOCATE('|||',lasts)-1);
-- 	SET lasts = SUBSTRING(lasts, LOCATE('|||', lasts) + 3);

--     SET @Author = (SELECT AuthorID FROM Authors WHERE AuthorFirst=@FirstStr AND AuthorLast=@LastStr);

--     IF @Author > 0 THEN INSERT INTO ToolAuthors VALUES(@id, @Author);
--     ELSE INSERT INTO Authors (AuthorFirst, AuthorLast) VALUES (@FirstStr, @LastStr);
--     SET @AuthorInsertedID = LAST_INSERT_ID();
--     INSERT INTO ToolAuthors VALUES (@id, @AuthorInsertedID);
--     END IF;
-- END WHILE;

WHILE (LOCATE('|||', institutes) > 0)
DO
	SET @InstituteStr = SUBSTRING(institutes, 1, LOCATE('|||',institutes)-1);
	SET institutes = SUBSTRING(institutes, LOCATE('|||', institutes) + 3);

    INSERT INTO Institutes VALUES(@id, @InstituteStr);
END WHILE;

WHILE (LOCATE('|||', fundings) > 0)
DO
	SET @FundingStr = SUBSTRING(fundings, 1, LOCATE('|||',fundings)-1);
	SET fundings = SUBSTRING(fundings, LOCATE('|||', fundings) + 3);

    INSERT INTO Fundings VALUES(@id, @FundingStr);
END WHILE;

WHILE (LOCATE('|||', domains) > 0)
DO
	SET @DomainStr = SUBSTRING(domains, 1, LOCATE('|||',domains)-1);
	SET domains = SUBSTRING(domains, LOCATE('|||', domains) + 3);

    INSERT INTO ToolDomains VALUES(@id, @DomainStr);
END WHILE;

WHILE (LOCATE('|||', platforms) > 0)
DO
	SET @PlatformStr = SUBSTRING(platforms, 1, LOCATE('|||',platforms)-1);
	SET platforms = SUBSTRING(platforms, LOCATE('|||', platforms) + 3);

    INSERT INTO PlatformType VALUES(@id, @PlatformStr);
END WHILE;

WHILE (LOCATE('|||', inputFiles) > 0)
DO
	SET @InputStr = SUBSTRING(inputFiles, 1, LOCATE('|||',inputFiles)-1);
	SET inputFiles = SUBSTRING(inputFiles, LOCATE('|||', inputFiles) + 3);

    INSERT INTO ToolInputs VALUES(@id, @InputStr);
END WHILE;

WHILE (LOCATE('|||', outputFiles) > 0)
DO
	SET @OutputStr = SUBSTRING(outputFiles, 1, LOCATE('|||',outputFiles)-1);
	SET outputFiles = SUBSTRING(outputFiles, LOCATE('|||', outputFiles) + 3);

    INSERT INTO ToolOutputs VALUES(@id, @OutputStr);
END WHILE;

WHILE (LOCATE('|||', dependencies) > 0)
DO
	SET @DependencyStr = SUBSTRING(dependencies, 1, LOCATE('|||',dependencies)-1);
	SET dependencies = SUBSTRING(dependencies, LOCATE('|||', dependencies) + 3);

    INSERT INTO Dependencies VALUES(@id, @DependencyStr);
END WHILE;

WHILE (LOCATE('|||', tags) > 0)
DO
	SET @TagStr = SUBSTRING(tags, 1, LOCATE('|||',tags)-1);
	SET tags = SUBSTRING(tags, LOCATE('|||', tags) + 3);

    INSERT INTO Tags VALUES(@id, @TagStr);
END WHILE;

WHILE (LOCATE('|||', maintainers) > 0)
DO
	SET @MaintainerStr = SUBSTRING(maintainers, 1, LOCATE('|||',maintainers)-1);
	SET maintainers = SUBSTRING(maintainers, LOCATE('|||', maintainers) + 3);

    INSERT INTO Maintainers VALUES(@id, @MaintainerStr);
END WHILE;

SELECT @id as id;

END$$

DELIMITER ;


GRANT ALL PRIVILEGES ON BD2K.* To 'root'@'localhost' IDENTIFIED BY 'scailab';