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


class Suppressor:
    '''
    Suppress exceptions, better than wrapping every single statement in a try catch block
    '''

    def __init__(self, exception_type, obj, output, id):
        self._exception_type = exception_type
        self.obj = obj
        self.output = output
        self.id = id

    def __call__(self, expression):
        try:
            exec expression
        except self._exception_type as e:
            print 'Suppressor: suppressed exception %s with content \'%s\'' % (type(self._exception_type), e)


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


def add_github_data(s, output, obj):
    s.__call__(
        'self.output["language"] = self.obj["github_data"]["languages"]')
    s.__call__(
        'self.output["dateUpdated"] = self.obj["github_data"]["updated_at"]')
    s.__call__('self.output["owners"] = self.obj["github_data"]["owner"]')
    s.__call__(
        'self.output["licenses"] = self.obj["github_data"]["license"]')
    s.__call__(
        'self.output["dateCreated"] = self.obj["github_data"]["created_at"]')
    s.__call__(
        'self.output["maintainers"] = str(self.obj["github_data"]["contributors"])')
    try:
        latest = True
        prev = []
        for version in obj["github_data"]["versions"]:
            if latest:
                output["latest_version"] = version["zipball_url"]
                latest = False
                continue
            prev.append(version["zipball_url"])
        output['prev_version'] = prev
    except Exception as e:
        print e

    s.__call__(
        'self.output["subscribers"] = self.obj["github_data"]["subscribers"]')
    s.__call__('self.output["forks"] = self.obj["github_data"]["forks"]')


def add_sourceforge_data(s):
    s.__call__(
        'self.output["language"] = self.obj["sourceforge_data"]["languages"]')
    s.__call__(
        'self.output["licenses"] = self.obj["sourceforge_data"]["license"]')
    s.__call__(
        'self.output["maintainers"] = str(self.obj["sourceforge_data"]["developers"])')
    s.__call__(
        'self.output["latest_version"] = str(self.obj["sourceforge_data"]["Development Status"])')


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


def main(data):
    start_id = get_starting_id()
    cur_id = start_id
    with open(data, 'rU') as f:
        for obj in json_parse(f):
            output = dict()
            id = get_id_from_solr(obj['doi'])
            if id is None:
                id = cur_id
                increment = True
            else:
                increment = False
            s = Suppressor(Exception, obj, output, str(id))
            s.__call__('self.output["id"] = self.id')

            s.__call__('self.output["name"] = self.obj["toolName"]')
            s.__call__('self.output["publicationDOI"] = self.obj["doi"]')
            s.__call__(
                'self.output["sourceCodeURL"] = self.obj["sourcelinks"]')
            s.__call__('self.output["linkUrls"] = self.obj["links"]')
            s.__call__('self.output["authors"] = self.obj["authors"]')
            s.__call__('self.output["funding"] = self.obj["grants"]')
            s.__call__('self.output["lastUpdatedMilliseconds"] = self.obj["updated"]')

            if 'github_data' in obj:
                add_github_data(s, output, obj)
                s.__call__('self.output["repo"] = "github"')
            elif 'sourceforge_data' in obj:
                s.__call__('self.output["repo"] = "sourceforge"')
                add_sourceforge_data(s)
            else:
                s.__call__('self.output["name"] = self.obj["title"]')

            if 'language' not in output:
                s.__call__(
                    'self.output["language"] = self.obj["technologies"]')

            s.__call__('self.output["tags"] = self.obj["keyWords"]')
            s.__call__('self.output["citations"] = self.obj["citations"]')
            s.__call__('self.output["description"] = self.obj["abstract"]')
            s.__call__('self.output["summary"] = self.obj["summary"]')
            s.__call__(
                'self.output["acknowledgements"] = self.obj["acks"]')
            s.__call__(
                'self.output["institutions"] = self.obj["affiliations"]')
            s.__call__(
                    'self.output["dateCreated"] = self.obj["dateCreated"]')

            to_insert.append(output)
            if increment:
                cur_id += 1

    print "Total size is " + str(len(to_insert))
    for obj in to_insert:
        push_to_solr(obj)

if __name__ == '__main__':
    main(sys.argv[1])
