import argparse 
import json 
from pprint import pprint

# README.md:
# This script is to read the json records generated on form entry by the user/automated scripts used previously, 
# and extract only those records that are manually submitted by the users ('source': 'User Submitted') and with a PublicationDOI.
# Please use: 'python json_extract.py -h' to see options. 

def checkIfUserSubmited(record):
	if record['source'] == 'User Submission':
		return True
	return False

def checkIfHasPublicationDOI(record):
	if 'publicationDOI' in record:
		if record['publicationDOI'] != '':
			return True
	return False

def readRecords(filename):
	json_data = open(filename, 'r')
	data = json.load(json_data)
	json_data.close()
	return data

def writeRecords(records, filename):
	outfile = open(filename, 'w')
	outfile.write(json.dumps(records, indent = 2))
	outfile.close()

def main():
	# Parse command line args. 
	parser = argparse.ArgumentParser()
	parser.add_argument('-source', help = "Source records submitted by user from FORM. Format as in 'solrResources.json'.", type = str)
	parser.add_argument('-USRFilename', help = "Destination file to write records which are 'User Submitted'.", type = str) # 'data/userSubmittedRecords.json'
	parser.add_argument('-USRPubDOIFilename', help = "Destination file to write records which are 'User Submitted' and have a 'PublicationDOI'.", type = str) # 'data/userSubmittedWithPubDOIs.json'
	args = parser.parse_args()

    # Load json to dict. 
	data = readRecords(args.source) # 'data/solrResources.json'

	# Access each record in json. Extract only 'User Submission' records. 
	count = 1
	records = data['response']['docs']
	userSubmittedRecords = {}
	userSubmittedWithPubDOIs = {}
	for record in records: 
	    if checkIfUserSubmited(record):
	        userSubmittedRecords[record['name']] = record
	        if checkIfHasPublicationDOI(record):
	            userSubmittedWithPubDOIs[record['name']] = record
	        count += 1
	print("# of 'User Submission' data: " + str(count))

	# Write to separate file. 
	writeRecords(userSubmittedRecords, args.USRFilename)
	writeRecords(userSubmittedWithPubDOIs, args.USRPubDOIFilename)

if __name__ == '__main__':
    main()



