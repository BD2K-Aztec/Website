#!/bin/sh

# This script clears the terminal first. (Grobid service is assumed running.)
# The script then makes calls to the other 4 python scripts in the directory
# in order: begining with the user submitted data on form entry to finally the
# extraction of the relevant fields such as author names, author affiliations,
# title of publication, abstract, conclusions/resulst, acknowledgements,
# all links, some predicted source links and grant information.

clear
mkdir  $PWD/../slots-extraction/data/$1/slotExtracts
mkdir  $PWD/../slots-extraction/data/$1/textExtracts
mkdir  $PWD/../slots-extraction/data/$1/XMLExtracts

python $PWD/../slots-extraction/scripts/pdf_extract.py -pdfpath $PWD/../slots-extraction/data/$1/ -outpathXML $PWD/../slots-extraction/data/$1/XMLExtracts/ -outpathText $PWD/../slots-extraction/data/$1/textExtracts/
python $PWD/../slots-extraction/scripts/parse_extracts.py -XMLFiles $PWD/../slots-extraction/data/$1/XMLExtracts/ -textFiles $PWD/../slots-extraction/data/$1/textExtracts/ -correctDOIRecords $PWD/../slots-extraction/data/$1/correctDOIRecords.json -outfile $PWD/../slots-extraction/data/$1/slotExtracts/slot_extracts.json
