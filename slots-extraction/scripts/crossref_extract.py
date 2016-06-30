import argparse
import json 
import re
import urllib2 # Note: For python 3.x use urllib.request

# README.md:
# This script is to: 
# Read the tool records which ahve a PublicationDOI entered as part of the form entry by the Users. 
# Determine if the DOI is correct or incorrect. Get the CrossRef record for the correct DOIs, 
# append to tool record and write to file. Additionally, the publishers count is also extracted for analysis. 
# Please use: 'python crossred_check.py -h' for options. 

def readRecords(filename):
    json_data = open(filename, 'r')
    data = json.load(json_data)
    json_data.close()
    return data

def writeRecords(records, filename):
    outfile = open(filename, 'w')
    outfile.write(json.dumps(records, indent = 2))
    outfile.close()

def getPublicationName(record):
    pubName = 'No Name'
    if "name" in record:
        pubName = record["name"]
    return pubName

def getPublicationDOI(record):
    pubDOI = record["publicationDOI"]
    pubDOI = pubDOI.replace(" ", "")
    return pubDOI

def getCrossRefRecord(pubDOI):
    crossrefQuery = "http://api.crossref.org/works/" + pubDOI.encode('utf8')
    doc = urllib2.urlopen(crossrefQuery + "/agency").read()
    crossrefRecord = json.loads(urllib2.urlopen(crossrefQuery).read())
    return crossrefRecord

def addToPublishers(publishers, crossrefRecord):
    print(crossrefRecord["message"]["publisher"])
    if crossrefRecord["message"]["publisher"] not in publishers:
        publishers[crossrefRecord["message"]["publisher"]] = 1
    else:
        publishers[crossrefRecord["message"]["publisher"]] += 1
    return publishers

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-source', help = "Json file with tool records which contain PublicationDOI. See: output of 'json_extract.py'.", type = str, required = True)
    parser.add_argument('-incorrectsOut', help = 'File to output tool records with incorrect PublicationDOI. (For analysis purpose.)', type = str, required = True)
    parser.add_argument('-correctsOut', help = 'File to output tool records with correct PublicationDOI (with CrossRef record also attach to each tool record).', type = str, required = True)
    parser.add_argument('-crossrefOut', help = 'File to output CrossRef records (only) for tools with correct PublicationDOI.(For analysis purpose.)', type = str, required = True)
    parser.add_argument('-journalsOut', help = 'File to output journal type couts. (For analysis purpose.)', type = str, required = True)
    args = parser.parse_args()

    # Read the records with publication DOIs. See: output of 'json_extract.py'. 
    records = readRecords(args.source)
    
    # Process each record to: 
    # Find out if they registered with crossref.
    # If yes, get its Crossref record (metadata).
    count = 0
    crossrefRecords = {}
    incorrectDOIRecords = {}
    correctDOIRecords = {}
    publishers = {}
    for record in records:
        pubName = getPublicationName(records[record])
        pubDOI = getPublicationDOI(records[record])
        try:
            crossrefRecord = getCrossRefRecord(pubDOI)
            publishers = addToPublishers(publishers, crossrefRecord)
            crossrefRecords[pubName] = crossrefRecord
            correctDOIRecords[pubName] = records[record] 
            correctDOIRecords[pubName]["crossRef"] = crossrefRecord 
        except urllib2.HTTPError: # 404 Error if DOI id incorrect. 
            incorrectDOIRecords[pubName] = records[record]
            count += 1

        # ANALYSIS.
        print(str(pubName) + ' -- ' + str(pubDOI.encode('utf8'))) 
        print(crossrefRecord)
    # ANALYSIS.
    if count == 0:
        print("All ok.")
    else: 
        print("Tot NOT CrossReffed: " + str(count))

    # Write records with incorrect DOIs, correct DOIs  and records with CrossRef records to file: 
    writeRecords(incorrectDOIRecords, args.incorrectsOut)
    writeRecords(crossrefRecords, args.crossrefOut)
    writeRecords(correctDOIRecords, args.correctsOut)
    writeRecords(publishers, args.journalsOut)

if __name__ == '__main__':
    main()
