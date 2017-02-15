import urllib2
from pysolr4 import Solr
import sys
import time
from parse_extracts import get_citations, get_git_info, get_sourceforge_info
import requests
import json
import subprocess
# README.md:
# This script connects to the local solr database running on port 8983
#  and updates the metadata of every publication.

to_fetch = 100000
# number of milliseconds in 3 weeks, do not update publication if time difference less
# than this
threshold = 21 * 24 * 3600 * 1000
millis = long(round(time.time() * 1000))
delimiters = [' ', ',', '   ', ';', ':']
solr = None

# TODO:
# Find a solr client which makes it easier to update fields in documents


class Document(object):
    id = None
    doiNumber = None
    updated = None
    shouldUpdate = True
    uDoi = None
    citations = None
    latest_version = None
    prev = []
    repo = None

documents = []


def get_documents(result):
    for doc in result.docs:
        d = Document()
        d.id = doc['id']

        if 'lastUpdatedMilliseconds' in doc:
            d.updated = doc['lastUpdatedMilliseconds']
            if millis - d.updated < threshold:
                d.shouldUpdate = False
                print "Skipping doc with id " + d.id
                continue

        if 'repo' in doc:
            d.repo = doc['repo']

        if 'publicationDOI' in doc:
            uglyDoi = doc['publicationDOI']
            d.uDoi = uglyDoi
        else:
            continue

        # Some dois are incorrectly formatted, extract doi
        doi = ""
        flag = 0
        for c in uglyDoi:
            if c == '1' and flag == 0:
                flag = 1
                doi += c
                continue
            if c in delimiters and flag == 1:
                break
            if flag == 1:
                doi += c
        d.doiNumber = doi
        documents.append(d)


def push_to_solr(data):
    print data
    solr.update(data).commit()


def parse_github_data(result, doc):
    try:
        latest = True
        for version in result["github_data"]["versions"]:
            if latest:
                doc.latest_version = version["zipball_url"]
                latest = False
                continue
            doc.prev.append(version["zipball_url"])
    except Exception as e:
        print e

    data = '{"id":"' + str(doc.id) + '", "citations":{"set":' + str(doc.citations) + '},"lastUpdatedMilliseconds":{"set":' + str(
        millis) + '},"prev_version":{"set":' + doc.prev + '},"latest_version":{"set":' + doc.latest_version + '} \
        ,"subscribers":{"set":' + result["subsribers"] + '},"forks":{"set":' + result["forks"] + '}, \
        "dateUpdated":{"set":' + result["updated_at"] + '}}'

    push_to_solr(json.loads(data))


def parse_sourceforge_data(result, doc):
    data = '{"id":"' + str(doc.id) + '", "citations":{"set":' + str(
        doc.citations) + '},"lastUpdatedMilliseconds":{"set":' + str(
        millis) + '},"latest_version":{"set":' + result["Development Status"] + '}}'

    push_to_solr(json.loads(data))


def update_metadata(doc):
    if doc['repo'] == 'github':
        result = get_git_info(doc['toolName'])
        time.sleep(0.25)                         # Github Search API limit is 30 requests per minute
        parse_github_data(result, doc)
    else:
        result = get_sourceforge_info(doc['toolName'])
        parse_sourceforge_data(result, doc)


# Given an array of ints, shift all non zero values to the left. Doesn't matter what's on the right.
# Write operations are expensive, minimize them. Constant space, linear time.

def main(json_data):
    global solr
    solr = Solr('http://localhost:8983/solr/BD2K')
    if not json_data:
        # Update the usual stuff for all documents in the database
        result = solr.select(('q', '*:*'), ('rows', str(to_fetch)), ('wt', 'json'),
                             ('fl', 'id,publicationDOI,lastUpdatedMilliseconds,repo,toolName'))
        get_documents(result)
        for doc in documents:
            if doc.doiNumber is not None and doc.shouldUpdate:
                doc.citations = get_citations(doc.doiNumber)
                print "Unformatted DOI is " + doc.uDoi
                print "Extracted DOI is " + doc.doiNumber
                print "Citations found are " + doc.citations
                if doc.repo is not None:
                    update_metadata(doc)
                else:
                    data = '{"id":"' + str(doc.id) + '", "citations":{"set":' + str(
                        doc.citations) + '},"lastUpdatedMilliseconds":{"set":' + str(
                        millis) + '}}'
                    push_to_solr(json.loads(data))
    else:
        print "Json data is   "
        print json_data
        json_data = json.loads(json_data)
        result = solr.select(('q', 'id:'+json_data['id']), ('wt', 'json'))
        doc = result.docs[0]
        solr_data = dict()
        for key, value in doc.iteritems():
            if 'suggest' in key:
                # These fields are automatically set based on others
                continue
            solr_data[key] = value
        for key, value in json_data.iteritems():
            if key == 'id':
                continue
            solr_data[key] = {"set": value}
        push_to_solr(solr_data)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
