import json
import subprocess
from json import JSONDecoder
from functools import partial
import sys
from pysolr4 import Solr
port = 8983
to_insert = []
to_fetch = 100000000 # all documents in Solr database
id_doi = dict()


def json_parse(fileobj, decoder=JSONDecoder(), buffersize=2048):
    buf = ''
    for chunk in iter(partial(fileobj.read, buffersize), ''):
        buf += chunk
        while buf:
            try:
                result, index = decoder.raw_decode(buf)
                yield result
                buf = buf[index:]
            except ValueError:
                # Not enough data to decode, read more
                break


def set_id_owners(f, cur_id, owners):
    for obj in json_parse(f):
        id = get_id_from_solr(obj['publicationDOI'])
        if id is None:
            id = cur_id
            increment = True
        else:
            increment = False
        if owners:
            obj["owners"] = owners
        obj["id"] = id

        to_insert.append(obj)
        if increment:
            cur_id += 1


def push_to_solr(output):
    output = json.dumps(output)
    subprocess.call(
        [
            "curl",
            "-X",
            "-POST",
            "-H",
            "Content-Type: application/json",
            "http://localhost:" +
            str(port) +
            "/solr/BD2K/update/json/docs/?commit=true",
            "--data-binary",
            output
        ])

'''
ID system: Id's should be consecutive positive integers. Uniqueness is based off of DOI number.
'''


def get_starting_id():
    solr = Solr('http://localhost:8983/solr/BD2K')
    result = solr.select(('q', '*:*'), ('rows', str(to_fetch)), ('wt', 'json'),
                         ('fl', 'id, publicationDOI'))
    for doc in result.docs:
        if 'id' in doc and 'publicationDOI' in doc:
            id_doi[doc['publicationDOI']] = doc['id']

    return len(result.docs)+1


def get_id_from_solr(doi):
    if doi in id_doi:
        return id_doi[doi]
    return None


def main(data, owners=None):
    cur_id = get_starting_id()
    with open(data, 'rU') as f:
        set_id_owners(f, cur_id, owners)

    print "Total size is " + str(len(to_insert))
    for obj in to_insert:
        push_to_solr(obj)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
