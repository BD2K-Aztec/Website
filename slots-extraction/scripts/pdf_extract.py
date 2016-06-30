import argparse
import subprocess
from os import listdir
from os.path import isfile, join

# README.md:
# At this point, the script assumes that the Journal pdf for the correct publication DOI (previously determined using CrossRef) has been downloaded to a Folder.
# All PDFs within the folder are read and parsed through Grobid (which has pretrained CRF models in it) to extract the text in the PDF into an annotated XML.
# The XML is in TEI format. Additionally, the raw text from the PDF is also extract to a different folder.

def getAllFiles(path):
	mypath = path
	files = [f for f in listdir(mypath) if isfile(join(mypath, f)) and f!=".DS_Store"  and f!="README.md"]
	return files

def getXMLFromPDF(inFilename, outFilename):
	subprocess.call(["curl", "-v", "-include", "--form", "input=@" + inFilename,
					"192.168.99.100:8080/processFulltextDocument", "-o", outFilename])

def convertXMLToTEI(outFilename):
	lines = open(outFilename).readlines()
	open(outFilename, 'w').writelines(lines[7:-1]) # Remove HTTP status message from XMLs and append TEI.
	open(outFilename, 'a').writelines("</TEI>")

def getRawText(inFilename, outFilename):
	subprocess.call(["pdftotext", inFilename, outFilename])

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('-pdfpath', help = 'Location of journal pdf to extract metadata/fields from.', type = str, required = True)
	parser.add_argument('-outpathXML', help = 'Location/Folder to write the XML extraction of pdf to. (TEI format)', type = str, required = True)
	parser.add_argument('-outpathText', help = 'Location/Folder to write the Text extraction of pdf to.', type = str, required = True)
	args = parser.parse_args()

	# Get all files in path:
	files = getAllFiles(args.pdfpath)

	# Make curl calls to extract the xmls (annotated):
	for file in files:
		inFilename = args.pdfpath + file
		outFilename = args.outpathXML + file + ".xml"
		getXMLFromPDF(inFilename, outFilename)
		convertXMLToTEI(outFilename)

	# Make command line calls to extract raw text (NOT annotated):
	for file in files:
		inFilename = args.pdfpath + file
		outFilename = args.outpathText + file + ".txt"
		getRawText(inFilename, outFilename)

if __name__ == '__main__':
    main()
