#!/usr/bin/env bash
clear
mkdir  $PWD/../slots-extraction/data/$1/slotExtracts
mkdir  $PWD/../slots-extraction/data/$1/textExtracts
mkdir  $PWD/../slots-extraction/data/$1/XMLExtracts

python $PWD/../slots-extraction/scripts/pdf_extract.py $PWD/../slots-extraction/data/$1/ $PWD/../slots-extraction/data/$1/XMLExtracts/ $PWD/../slots-extraction/data/$1/textExtracts/
python $PWD/../slots-extraction/scripts/parse_extracts.py $PWD/../slots-extraction/data/$1/XMLExtracts/ $PWD/../slots-extraction/data/$1/textExtracts/ $PWD/../slots-extraction/data/$1/slotExtracts/slot_extracts.json $2
