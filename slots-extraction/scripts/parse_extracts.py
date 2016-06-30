import argparse
import codecs
import json
import nltk
import re
import string
import xmltodict
from nltk.tokenize import sent_tokenize
from nltk.tokenize import word_tokenize
from os.path import isfile, join
from os import listdir

# REDME.md:
# This final script then interacts with the XML and text extracts of the Journal pdf to extract: authors, author affiliations, title,
# links, some predictions of possible source links, abstract, conclusions/results, the keywords from the journal, keywords from the
# DOI (CrossRef record), acknowledgements and possible grant information.

def isCandidate(text, words):
    if text:
        for index in range(len(words)):
            if words[index].lower() in text.lower():
                return True
    return False

def checkHeadsGetBody(record, words):
    heads = []
    bodies = []
    text = record["TEI"]["text"]["body"]
    if isinstance(text, list):
        for index in range(len(text)):
            head = " "
            if text[index]:
                if "head" in text[index]:
                    head = text[index]["head"]
                    if isinstance(head, dict):
                        head = getAttribute(head, "#text")
                        if isCandidate(head, words):
                            body = " "
                            if "p" in text[index]:
                                p = text[index]["p"]
                                if isinstance(p, dict):
                                    body = body + (getAttribute(p, "#text") if getAttribute(p, "#text")!=None else " ") + " "
                                elif type(p) == list:
                                    for indexB in range(len(p)):
                                        if isinstance(p[indexB], basestring):
                                            body = body + p[indexB] + " "
                                        if isinstance(p[indexB], dict):
                                            body = body + (getAttribute(p[indexB], "#text") if getAttribute(p[indexB], "#text")!=None else " ") + " "
                                elif isinstance(p, basestring):
                                    body = body + p + " "
                            if(body != " "):
                                heads.append(head)
                                bodies.append(body)

    return heads, bodies

def getAttribute(record, attribute):
    if record == None:
        return None
    if attribute in record:
        return record[attribute]
    else:
        return None

def getAuthors(record):
    authorNames = []
    biblStruct = record["TEI"]["teiHeader"]["fileDesc"]["sourceDesc"]["biblStruct"]
    if "analytic" in biblStruct:
        if isinstance(biblStruct["analytic"], dict):
            if "author" in biblStruct["analytic"]:
                authorsRecord = biblStruct["analytic"]["author"]
                if isinstance(authorsRecord, list):
                    for index in range(len(authorsRecord)):
                        persName = getAttribute(authorsRecord[index], "persName")
                        fullname = " "
                        forename = getAttribute(persName, "forename")
                        if type(forename) == list:
                            for index in range(len(forename)):
                                fullname =  fullname + getAttribute(forename[index], "#text") + " "
                        elif forename is not  None:
                            fullname = fullname + getAttribute(forename, "#text") + " "
                        surname = getAttribute(persName, "surname") if getAttribute(persName, "surname")!=None else ""
                        fullname = fullname + surname
                        authorNames.append(fullname)
    return authorNames

def getAffiliations(record):
    affiliations = []
    biblStruct = record["TEI"]["teiHeader"]["fileDesc"]["sourceDesc"]["biblStruct"]
    if "analytic" in biblStruct:
        if isinstance(biblStruct["analytic"], dict):
            if "author" in biblStruct["analytic"]:
                authorsRecord = biblStruct["analytic"]["author"]
                if isinstance(authorsRecord, list):
                    for index in range(len(authorsRecord)):
                        aff = getAttribute(authorsRecord[index], "affiliation")
                        org = getAttribute(aff, "orgName")
                        fullname = " "
                        if type(org) == list:
                            for index in range(len(org)):
                                    fullname = fullname + getAttribute(org[index],"#text") + " "
                        elif org is not None:
                            fullname = fullname + getAttribute(org,"#text")
                        affiliations.append(fullname)
    return affiliations

def getTitle(record):
    title = getAttribute(record["TEI"]["teiHeader"]["fileDesc"]["titleStmt"]["title"], "#text")
    return title

def getAbstract(record):
    abstract = getAttribute(record["TEI"]["teiHeader"]["profileDesc"], "abstract")
    return (abstract["p"] if abstract!=None else "")


def getWordSentence(word, paragraph):
    sentences=sent_tokenize(paragraph)
    sentence_hits=[sent for sent in sentences if word in sent]
    return sentence_hits

# Get all sentences with grant information.
def getAllGrants(textRecord):
    words = ["fund", "support", "grant", "provide", "sponsor", "NIH", "NSF", "National"]
    sentences = []
    for word in words:
        sentences += getWordSentence(word, textRecord)
    return list(set(sentences))

def getAcknowledgement(record):
    divs = record["TEI"]["text"]["back"]["div"]
    text = " "
    if type(divs) == list:
        for index in range(len(divs)):
            div = divs[index]
            if div["@type"] == "acknowledgement":
                if "div" in div:
                    div = div["div"]
                    if type(div) == list:
                        for indexB in range(len(div)):
                            if div[indexB]:
                                if "p" in div[indexB]:
                                    p = div[indexB]["p"]
                                    if isinstance(p, dict):
                                        p = p["#text"]
                                    if isinstance(p, list):
                                        continue
                                    text = text + p + " "
                    else:
                        if div is not None and "p" in div:
                            p = div["p"]
                            if isinstance(p, dict):
                                p = p["#text"]
                            if isinstance(p, list):
                                continue
                            text = text + p + " "
                elif "p" in div:
                    text = text + div["p"] + " "
    return text

def getConclusion(record):
    keywords = ["conclusion", "result"]
    heads, bodies =  checkHeadsGetBody(record, keywords)
    full = []
    full.append(heads)
    full.append(bodies)
    return full

def readRecords(filename):
    json_data = open(filename, 'r')
    data = json.load(json_data)
    json_data.close()
    return data

def getKeywords(record, filename, key):
    # Keywords from CrossRef DOI reference:
    keywords = []
    dataRecord = readRecords(filename)
    if(key[:-4] in dataRecord):
        if "subject" in dataRecord[key[:-4]]["crossRef"]["message"]:
            keywords += dataRecord[key[:-4]]["crossRef"]["message"]["subject"]
        if "container-title" in dataRecord[key[:-4]]["crossRef"]["message"]:
            keywords += dataRecord[key[:-4]]["crossRef"]["message"]["container-title"]

    # Keywords from publication text:
    profile = record["TEI"]["teiHeader"]["profileDesc"]
    text = getAttribute(profile, "textClass")
    keys = getAttribute(text, "keywords")
    if isinstance(keys, basestring):
        keywords.append(keys)
    if isinstance(keys, dict):
        terms = getAttribute(keys, "term")
        keywords = terms
        if type(terms) == list:
            keywords = terms
    return list(set(keywords))

# A Summarization engine must be paid for hits and called here on abstract and conlcusion/results.
def summarize(sentences):
    summary = []
    return summary

def chopBehind(string):
    while(True):
        if(string[-1:].isalpha() or string[-1:].isdigit()):
            break
        else:
            string = string[:-1]
    return string

def getAllLinks(textRecord):
    # Remove new lines.
    textRecord = textRecord.replace('\n', '')
    # Remove multi-character spaces.
    textRecord = ' '.join(textRecord.split())
    # Extract all URLs.
    urls = re.findall('http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', textRecord)
    #table = string.maketrans('])','\0\0')
    urls = [str(chopBehind(url)) for url in urls]
    return list(set(urls))


def findSourceLinks(linksRecord, textRecord):
    words = ["source", "code", "download", "git", "github", "sourceforge", "programming language", "software"]
    # Remove new lines.
    textRecord = textRecord.replace('\n', '')
    # Remove multi-character spaces.
    textRecord = ' '.join(textRecord.split())
    # Get sentences with link
    sourceLinks = []
    for linkRecord in linksRecord:
        sentences = getWordSentence(linkRecord, textRecord)
        for sentence in sentences:
            for word in words:
                if str(word) in str(sentence):
                    sourceLinks.append(linkRecord)
    return list(set(sourceLinks))

def writeRecords(records, filename):
    outfile = open(filename, 'w')
    outfile.write(json.dumps(records, indent = 2))
    outfile.close()
    outfile = open(filename,'r')
    print outfile.read()

def getAllFiles(path):
    mypath = path
    files = [f for f in listdir(mypath) if isfile(join(mypath, f)) and f!=".DS_Store" and f!="README.md"]
    return files

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-XMLFiles', help = 'Folder containing the tool XML files to be parsed to extract the metadata.', type = str, required = True)
    parser.add_argument('-textFiles', help = 'Folder containing the tool text files to be parsed to extract all links.', type = str, required = True)
    parser.add_argument('-correctDOIRecords', help = 'JSON file containing tool records with correct Publication DOI.', type = str, required = True)
    parser.add_argument('-outfile', help = 'File to write ALL extracted metadata to after extraction form the tool XMLs.', type = str, required = True)
    args = parser.parse_args()

    files = getAllFiles(args.XMLFiles)

    count = 1
    publication_extractions = {}
    for file in files:
        # Read xml file.
        filepath = args.XMLFiles + file
        with codecs.open(filepath, "r",encoding='utf-8', errors='ignore') as f:
            read = f.read()

        # Convert: Xml to dictionary.
        dictionary = xmltodict.parse(read)

        # Read text of file.
        filepath = args.textFiles + file[:-4] + ".txt"
        with codecs.open(filepath, "r",encoding='utf-8', errors='ignore') as f:
            read = f.read()
        text = read

        # All extractions:
        title = getTitle(dictionary)
        authors = getAuthors(dictionary)
        affiliations = getAffiliations(dictionary)
        abstract = getAbstract(dictionary)
      #  keywords = getKeywords(dictionary, args.correctDOIRecords, file)
        links = getAllLinks(text)
        sourceLinks = findSourceLinks(links, text)
        ack = getAcknowledgement(dictionary)
        grants = getAllGrants(ack)
        conclusions = getConclusion(dictionary)
        summary = summarize(conclusions)

        # Push to dict.
        publication_extractions[file[:-4]] = {}
        publication_extractions[file[:-4]]["toolName"] = file[:-4]
        publication_extractions[file[:-4]]["abstract"] = abstract
        publication_extractions[file[:-4]]["pubTitle"] = title
        publication_extractions[file[:-4]]["authors"] = authors
        publication_extractions[file[:-4]]["affiliations"] = affiliations
       # publication_extractions[file[:-4]]["keywords"] = keywords
        publication_extractions[file[:-4]]["links"] = links
        publication_extractions[file[:-4]]["sourceLinks"] = sourceLinks
        publication_extractions[file[:-4]]["ack"] = ack
        publication_extractions[file[:-4]]["grants"] = grants
        publication_extractions[file[:-4]]["conclusions"] = conclusions
        publication_extractions[file[:-4]]["summary"] = summary


        # ANALYSIS:

    #     print("-------")
    #     print("Title: ")
    #     print(title)
    #     print("---")
    #     print("Authors: ")
    #     print(authors)
    #     print("---")
    #     print("Affiliations: ")
    #     print(affiliations)
    #     print("---")
    #     print("Abstract: ")
    #     print(abstract)
    #     #print("---")
    #     #print("Keywords: ")
    #     #print(keywords)
    #     print("---")
    #     print("Links: ")
    #     print(links)
    #     print("---")
    #     print("Possible Source links:")
    #     print(sourceLinks)
    #     print("---")
    #     print("Ack: ")  # If exists. Many pubs don't have ack! Eg: HARSH
    #     print(ack)
    #     if (len(ack) <= 3):
    #         count += 1
    #     print("---")
    #     print(grants)
    #     print("---")
    #     print("Conclusion: ")
    #     heads = conclusions[0]
    #     bodies = conclusions[1]
    #     for i in range(len(heads)):
    #         print("---")
    #         print(heads[i] + " :")
    #         print(bodies[i])
    #     print("-------")

    # # ANALYSIS:
    # print("Empty Ack: " + str(count))

    # Write extractions to file:
    writeRecords(publication_extractions, args.outfile)

if __name__ == '__main__':
    main()
