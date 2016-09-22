import codecs
import json
import re
import xmltodict
from nltk.tokenize import sent_tokenize
from os.path import isfile, join
from os import listdir
import requests
from summa import summarizer
from summa import keywords
import urllib
import time
from threading import Thread
import Queue
import urllib2
import xml.etree.ElementTree as ET
from inspect import currentframe
import sys

# This script interacts with the XML and text extracts of the Journal pdf to extract:
# authors, author affiliations, title, technologies, github/sourceforge data, institutions,
# links, some predictions of possible source links, abstract, conclusions/results,
# the keywords from the journal, acknowledgements, summary and possible grant information.


# Dummy Github account to get more API calls
user = "TestAccount2K"
password = "testpassword1"

publications = []
num_threads = 4  # Threads to use for crossref and pubmed API's
dois = dict()
xmlpath = None
textPath = None
agencies = set()
extract_doi = False
path = None
single_case_doi = None


def get_linenumber():
    '''
    Useful for analyzing where exceptions occur
    :return:
    '''
    cf = currentframe()
    return str(cf.f_back.f_lineno)


class MasterClass(Thread):
    '''
    Thread class which calls all functions on a publication and appends final
    publication object to the publications list.
    '''
    def __init__(self, queue):
        Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            # Get the work from the queue
            inputFile = self.queue.get()
            dictionary = read_xml_from_file(inputFile)
            text = read_text_from_file(inputFile)
            if not dictionary or not text:
                self.queue.task_done()
            else:
                pub = Publication()
                pub.name = str(inputFile).replace('.xml', '')
                if single_case_doi is not None:
                    pub.doi = single_case_doi
                if extract_doi:
                    extract_doi_grobid(dictionary, pub)
                start_tasks(dictionary, text, pub)
                update_info(pub, text)
                push_to_dict(pub)
                publications.append(pub)
                self.queue.task_done()


class Publication(object):
    def __init__(self):
        self.title = None
        self.authors = None
        self.affiliations = None
        self.grants = None
        self.abstract = None
        self.links = None
        self.sourcelinks = None
        self.keyWords = None
        self.summary = None
        self.technologies = None
        self.name = None  # This is the file name
        self.doi = None
        self.dateCreated = None
        self.toolName = None  # This is the tool name if github/sourceforge info is found
        self.github_data = None
        self.sourceforge_data = None
        self.acks = None
        self.citations = None
        self.updated = None
        self.data = dict()  # Dict to hold all data as key value pairs


def extract_doi_grobid(xml, pub):
    try:
        id = xml["TEI"]["teiHeader"][
        "fileDesc"]["sourceDesc"]["biblStruct"]['idno']
        if id["@type"] == "DOI":
            pub.doi = id["#text"]
    except Exception as e:
        print get_linenumber()
        print e


def push_to_dict(pub):
    '''
    Convert all other fields and their values to a dict and store it in data field,
    this is written to the ouput file
    '''
    try:
        for attr, value in pub.__dict__.iteritems():
            if value is not None and str(attr) is not "data":
                pub.data[attr] = value
    except Exception as e:
        print e
        print "Line number " + get_linenumber()
        print "Writing data failed with " + pub.name


def start_tasks(dictionary, text, publication):
    '''
    Start all those tasks which only need xml and text data
    :param dictionary: xml data
    :param text:
    :param publication:
    :return:
    '''
    get_title(dictionary, publication)
    get_authors(dictionary, publication)
    get_affiliations(dictionary, publication)
    get_abstract(dictionary, publication)
    get_all_links(text, publication)
    get_acks(dictionary, publication)
    get_all_grants(text, publication)
    summarize(text, publication)
    get_keywords(text, publication)
    get_technologies(text, publication)

    # Use all links to find source code links
    find_source_links(publication.links, text, publication)


def get_citations(doi):
    '''
    Get citations using crossref's api
    :param doi:
    :return: number of citations
    '''
    if "10." not in str(doi):
        "Invalid Doi number"
        return 0
    email = 'avirudhtheraja@gmail.com'
    url = 'http://www.crossref.org/openurl/?pid=' + \
        str(email) + '&id=doi:' + str(doi) + '&noredirect=true'
    response = urllib2.urlopen(str(url)).read()
    if "Malformed" in response:
        "Could not find citation data/ invalid doi number"
        return 0
    try:
        root = ET.fromstring(str(response))
        return root[0][1][0].attrib['fl_count']  # the number of citations
    except Exception as e:
        print e
        print "Line number " + get_linenumber()
        return 0


def fetch_crossref_info(pub):
    date = get_date(pub.doi)
    if date is not None:
        pub.dateCreated = date
    pub.citations = get_citations(pub.doi)
    pub.updated = long(round(time.time() * 1000))


def update_info(pub, text):
    '''
    Update information using doi and source links
    :param pub:
    :param text:
    :return:
    '''

    # Fetch date and citations of publication using doi.
    # Set updated field to record time when citations were updated.
    try:
        if pub.doi:
            fetch_crossref_info(pub)
        elif dois is not None:
            doi = dois[pub.name] if pub.name in dois else "Not found"
            pub.doi = doi
            if doi is not "Not found":
                fetch_crossref_info(pub)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # Try to get github/sourceforge data, and update toolName
    try:
        repo = find_code_source(pub.sourcelinks, text)
        if repo is not None:
            name = repo['name']
            pub.toolName = name
            if repo['github']:
                pub.github_data = get_git_info(name)
                if pub.github_data and 'url' in pub.github_data and pub.github_data['url'] not in pub.sourcelinks:
                    pub.sourcelinks.append(pub.github_data['url'])
            else:
                pub.sourceforge_data = get_sourceforge_info(name)
        else:
            pub.toolName = pub.title
    except Exception as e:
        print e
        print "Line number " + get_linenumber()
        print "Repository data extraction failed with " + pub.name


def is_candidate(text, words):
    '''
    Return true if any word in words exists in text
    :param text:
    :param words:
    '''
    if text:
        for index in range(len(words)):
            if words[index].lower() in text.lower():
                return True
    return False


def get_attribute(record, attribute):
    if record is None:
        return None
    if attribute in record:
        return record[attribute]
    return None


def get_authors(record, pub):
    authorNames = []
    biblStruct = record["TEI"]["teiHeader"][
        "fileDesc"]["sourceDesc"]["biblStruct"]
    if "analytic" in biblStruct:
        if isinstance(biblStruct["analytic"], dict):
            if "author" in biblStruct["analytic"]:
                authorsRecord = biblStruct["analytic"]["author"]
                if isinstance(authorsRecord, list):
                    for index in range(len(authorsRecord)):
                        persName = get_attribute(
                            authorsRecord[index], "persName")
                        fullname = " "
                        forename = get_attribute(persName, "forename")
                        if isinstance(forename, list):
                            for pos in range(len(forename)):
                                fullname = fullname + \
                                           get_attribute(forename[pos], "#text") + " "
                        elif forename is not None:
                            fullname = fullname + \
                                       get_attribute(forename, "#text") + " "
                        surname = get_attribute(
                            persName, "surname") if get_attribute(
                            persName, "surname") is not None else ""
                        fullname = fullname + surname
                        authorNames.append(fullname)
    pub.authors = authorNames


def get_affiliations(record, pub):
    affiliations = []
    biblStruct = record["TEI"]["teiHeader"][
        "fileDesc"]["sourceDesc"]["biblStruct"]
    if "analytic" in biblStruct:
        if isinstance(biblStruct["analytic"], dict):
            if "author" in biblStruct["analytic"]:
                authorsRecord = biblStruct["analytic"]["author"]
                if isinstance(authorsRecord, list):
                    for index in range(len(authorsRecord)):
                        aff = get_attribute(authorsRecord[index], "affiliation")
                        org = get_attribute(aff, "orgName")
                        fullname = " "
                        if isinstance(org, list):
                            for pos in range(len(org)):
                                fullname = fullname + \
                                           get_attribute(org[pos], "#text") + " "
                        elif org is not None:
                            fullname = fullname + get_attribute(org, "#text")
                        affiliations.append(fullname)

    filtered = filter(lambda x: not re.match(r'^\s*$', x),
                      affiliations)  # Remove whitespaces
    pub.affiliations = list(set(filtered))


def get_title(record, pub):
    pub.title = get_attribute(record["TEI"]["teiHeader"]["fileDesc"][
                        "titleStmt"]["title"], "#text")


def get_technologies(text, pub):
    # Common databases and API services
    techWords = [
        " SOAP ",
        " REST ",
        " mongoDB ",
        " Cassandra ",
        " Redis ",
        " SQL ",
        " Solr ",
        " Sybase ",
        " Oracle ",
        " couchDB "]
    filters = [
        " used ",
        " program ",
        " programmed ",
        " written ",
        " coded ",
        "package"]
    valid = [" ", ".", ",", ":", ";", "-"]
    found = []
    '''
    Find programming languages in text and analyze character before and after
    the language to determine if text is actually talking about the programming language
    '''
    with open(path+'/util/languages.txt', 'rU') as f:
        for line in f:
            line = line.rstrip()
            matches = get_word_sentence(line, text)
            flag = False
            for match in matches:
                for word in filters:
                    if word in match:
                        index = match.find(line)
                        if index == 0:
                            if match[index + len(line)] not in valid:
                                continue
                        elif index == len(match) - 1:
                            if match[index - 1] not in valid:
                                continue
                        elif match[index + len(line)] not in valid or match[index - 1] not in valid:
                            continue
                        found.append(line)
                        flag = True
                        break
                if flag:
                    break

    for word in techWords:
        if word in text:
            found.append(word)
    pub.technologies = list(set(found))


def get_abstract(record, pub):
    abstract = get_attribute(record["TEI"]["teiHeader"][
                            "profileDesc"], "abstract")
    pub.abstract = abstract["p"] if abstract is not None else ""


def get_word_sentence(word, paragraph):
    '''
    :param word:
    :param paragraph:
    :return: sentence which contains word
    '''
    sentences = sent_tokenize(paragraph.decode('utf-8'))
    sentence_hits = [sent for sent in sentences if word in sent]
    return sentence_hits


def is_number(noun):
    '''
    Check if noun is a grant number or not
    :param noun:
    :return: grant number if found else False
    '''
    checker = re.findall('[\d]', noun)
    if len(checker) < 5:
        return False
    if checker:
        number = re.findall('[\d\w/-]+', noun)
        return number[0]
    return False


def is_agency(noun):
    if noun in agencies:
        return True
    return False


def get_all_grants(textRecord, pub):
    words = [
        "funds",
        "grant",
        "sponsor",
        "funding",
        "Funding",
        "funded",
        "Sponsor",
        "Grant"]
    sentences = []
    for word in words:
        sentences += get_word_sentence(word, textRecord)
    sentences = list(set(sentences))
    result = []
    grant_stack = []
    agency_stack = []
    '''
    Algorithm: Find relevant sentences
    if agency/grant: append to appropriate stack
    else try all combinations to check if that combination is an agency
    This is more efficient than seeing if any agency exists in sentence as
    agency set is very large
    Store as tuple with index
    Assign the correct grants to the agencies by giving them indices and setting a
    minimum threshold as all agencies are not in the list
    '''
    for sentence in sentences:
        words = sentence.split()
        words = [word.replace('.', '') for word in words]
        added = []
        for i in range(0, len(words)):
            if i in added:
                continue
            word = words[i]
            if is_agency(word):
                agency_stack.append((word, i))
                continue
            number = is_number(word)
            if number:
                grant_stack.append((number, i))
                continue
            for j in range(i + 1, len(words)):
                word += " " + words[j]
                if is_agency(word):
                    added += range(i, j + 1)
                    agency_stack.append((word, j))
                    break
        threshold = 4
        if grant_stack:
            for grant, grant_index in grant_stack:
                best_agency = None
                minimum = 100000
                for agency, agency_index in agency_stack:
                    if abs(grant_index - agency_index) < minimum:
                        minimum = abs(grant_index - agency_index)
                        best_agency = agency
                if minimum > threshold or best_agency is None:
                    result.append(("Agency not found", grant))
                    continue
                result.append((best_agency, grant))
        elif agency_stack:
            for agency, agency_index in agency_stack:
                result.append((agency, "Grant not found"))

    grantless_agencies = []
    for agency, grant in result:
        if grant is "Grant not found":
            grantless_agencies.append((agency, grant))
    result = [(agency, grant) for (agency, grant) in result if (agency, grant) not in grantless_agencies]
    result_agencies = [agency for (agency, grant) in result]
    for agency, grant in grantless_agencies:
        if agency not in result_agencies:
            result.append((agency, grant))

    pub.grants = result


def get_acks(record, pub):
    divs = record["TEI"]["text"]["back"]["div"]
    text = " "
    if isinstance(divs, list):
        for index in range(len(divs)):
            div = divs[index]
            if div["@type"] == "acknowledgement":
                if "div" in div:
                    div = div["div"]
                    if isinstance(div, list):
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
    pub.acks = text


def get_unique_words(words, threshold):
    '''
    Filter out same looking words such as gene, genes, genetic etc
    Choose longest word and eliminate duplicates having threshold
    number of same consecutive characters
    :param words:
    :param threshold:
    :return:
    '''
    ignore_words = []
    length = len(words)
    for i in range(0, length):
        word = words[i]
        for j in range(i + 1, length):
            second_word = words[j]
            len_min = len(word) if len(word) < len(
                second_word) else len(second_word)
            similarity = 0
            for k in range(0, len_min):
                if word[k] != second_word[k]:
                    break
                similarity += 1
            if similarity > threshold:
                ignore = word if len(word) < len(second_word) else second_word
                ignore_words.append(ignore)
    return list(set(words) - set(ignore_words))


def get_keywords(text, pub):
    numWords = 8
    try:
        keyWords = keywords.keywords(text, words=numWords).split('\n')
        threshold = 3
        # Discard words less than or equal to threshold characters
        words = [s.lower() for s in keyWords if len(s) > threshold]
        finalWords = []
        for word in words:      # Include words with spaces, example sequence alignment
            if " " in word:
                finalWords.append(word)
        words = list(set(words) - set(finalWords))
        pub.keyWords = finalWords + get_unique_words(words, threshold)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e


def summarize(sentences, pub):
    try:
        pub.summary = summarizer.summarize(sentences, words=100)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e


def chop_behind(string):
    '''
    Get rid of non alphanumeric characters at the end of a string
    :param string:
    :return:
    '''
    while True:
        if string[-1:].isalpha() or string[-1:].isdigit():
            break
        else:
            string = string[:-1]
    return string


def get_all_links(textRecord, pub):
    # Remove new lines.
    textRecord = textRecord.replace('\n', ' ')
    # Remove multi-character spaces.
    textRecord = ' '.join(textRecord.split())
    # Extract all URLs.
    regex = 'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(regex, textRecord)
    urls = [str(chop_behind(url)) for url in urls]
    pub.links = list(set(urls))


def find_source_links(linksRecord, textRecord, pub):
    words = [
        "source",
        "code",
        "download",
        "git",
        "github",
        "sourceforge",
        "programming",
        "program",
        "available",
        "implementation"
        "software"]
    # Remove new lines.
    textRecord = textRecord.replace('\n', ' ')
    # Remove multi-character spaces.
    textRecord = ' '.join(textRecord.split())
    # Get sentences with link
    sourceLinks = []
    for linkRecord in linksRecord:
        sentences = get_word_sentence(linkRecord, textRecord)
        for sentence in sentences:
            for word in words:
                if word in sentence:
                    sourceLinks.append(linkRecord)
    pub.sourcelinks = list(set(sourceLinks))

'''
Suppressor class used to supress exceptions when converting to Solr schema format
'''
class Suppressor:
    '''
    Suppress exceptions, better than wrapping every single statement in a try catch block
    '''

    def __init__(self, exception_type, obj, output):
        self._exception_type = exception_type
        self.obj = obj
        self.output = output
        self.id = id

    def __call__(self, expression):
        try:
            exec expression
        except self._exception_type as e:
            print 'Suppressor: suppressed exception %s with content \'%s\'' % (type(self._exception_type), e)


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


'''
Function which converts all publication fields to Solr format
'''
def convert_to_solr(publications):
    to_insert = []
    for obj in publications:
        obj = obj.data
        output = dict()
        s = Suppressor(Exception, obj, output)

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
    return to_insert

'''
Convert document fields to Solr format then write to file
'''
def write_records(filename):
    print "Writing extracted data for " + str(len(publications)) + " publications"
    final_docs = convert_to_solr(publications)
    with open(filename, 'w') as outfile:
        for pub in final_docs:
            outfile.write(json.dumps(pub, indent=4))


def get_all_files(path):
    mypath = path
    files = [f for f in listdir(mypath) if isfile(
        join(mypath, f)) and f != ".DS_Store" and f != "README.md"]
    return files


def extract_git_json(git_json):
    '''
    Return all relevant information from github api as a dict object
    :param git_json:
    :return:
    '''
    # Basic info
    result = dict()
    try:
        item = git_json['items'][0]
        result['name'] = item['name']
        result['owner'] = item['owner']['html_url']
        result['updated_at'] = item['updated_at']
        result['created_at'] = item['created_at']
        result['url'] = item['html_url']
        result['homepage'] = item['homepage'] if item[
            'homepage'] != "null" else None
    except Exception as e:
        print e
        print "Line number " + get_linenumber()
        return None

    # Contributors
    try:
        contributors_url = item['contributors_url']
        r = requests.get(contributors_url, auth=(user, password))
        contributors_json = json.loads(r.text)
        list = []
        for obj in contributors_json:
            list.append({"html_url": obj['html_url'],
                         "contributions": obj['contributions']})
        result['contributors'] = list
    except Exception as e:
        print "Line number " + get_linenumber()
        print e
    # print contributors_json

    # Languages

    try:
        languages_url = item['languages_url']
        r = requests.get(languages_url, auth=(user, password))
        languages_json = json.loads(r.text)
        langs = []
        for k, v in languages_json.items():
            langs.append(k)
        result['languages'] = langs
    except Exception as e:
        print "Line number " + get_linenumber()
        print e
    # print languages_json

    # Versions i.e tags

    try:
        tags_url = item['tags_url']
        r = requests.get(tags_url, auth=(user, password))
        version_json = json.loads(r.text)
        versions = []
        for obj in version_json:
            versions.append({"name": obj['name'],
                             "zipball_url": obj['zipball_url'],
                             "tarball_url": obj['tarball_url']})
        result['versions'] = versions
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # print version_json

    # Subscribers

    try:
        subscribers_url = item['subscribers_url']
        r = requests.get(subscribers_url, auth=(user, password))
        subscribers_json = json.loads(r.text)
        result['subscribers'] = len(subscribers_json)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # License

    try:
        license_url = str(item['url']) + "/license"
        r = requests.get(license_url, auth=(user, password))
        license_json = json.loads(r.text)
        licenses = []
        licenses.append(license_json['license']['name'])
        licenses.append(license_json['download_url'])
        result['license'] = licenses
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # Forks

    try:
        forks_url = item['forks_url']
        r = requests.get(forks_url, auth=(user, password))
        forks_json = json.loads(r.text)
        result['forks'] = len(forks_json)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    return result


def get_git_info(repo):
    '''
    Query github API with the repository name
    :param repo:
    :return:
    '''
    url = "https://api.github.com/search/repositories?q="
    try:
        r = requests.get(str(url) + str(repo), auth=(user, password))
        parsed_json = json.loads(r.text)
        if parsed_json['total_count'] == 0:
            return None
        return extract_git_json(parsed_json)
    except Exception as e:
        print "Line number " + get_linenumber()
        print e
        return None


def extract_sourceforge_repo(link):
    '''
    Extract repo name from a sourceforge url
    :param link:
    :return:
    '''
    link = str(link)
    list = link.split('/')
    try:
        index = list.index("projects")
        return list[index + 1]
    except:
        pass

    try:
        index = list.index("p")
        return list[index+1]
    except:
        pass

    try:
        link = link.replace("http://", '')
        list = link.split('.')
        return list[0]
    except:
        print link
        print "Invalid sourceforge url"


def find_code_source(sourcelinks, text):
    '''
    Find github or sourceforge links in the source links
    :param sourcelinks:
    :param text:
    :return:
    '''
    possibleGitRepos = []
    possibleSFRepos = []
    for link in sourcelinks:
        if "github" in link:
            list = str(link).split('/')
            # Repo name, since github urls have users too
            try:
                possibleGitRepos.append(list[-1])
            except:
                print link
                print "Invalid github url"
        elif "sourceforge" in link:
            try:
                found = extract_sourceforge_repo(link)
                if found:
                    possibleSFRepos.append(found)
            except:
                print link
                print "Invalid sourceforge url"
    max_count = 0
    result = dict()
    for repo in possibleGitRepos:           # Actual repo name will occur most frequently in text
        count = text.count(repo)
        if count > max_count:
            max_count = count
            result['name'] = repo
            result['github'] = True
    if not result:                       # Go with github if possible else try sourceforge
        for repo in possibleSFRepos:
            count = text.count(repo)
            if count > max_count:
                max_count = count
                result['name'] = repo
                result['github'] = False
    return None if not result else result


def get_sourceforge_info(repo):
    '''
    Return all relevant info from sourceforge api as a dict object
    :param repo:
    :return:
    '''
    url = "https://sourceforge.net/rest/p/" + str(repo)
    r = requests.get(url)
    json_info = json.loads(r.text)
    result = dict()
    result['url'] = json_info['url']

    # Developers
    try:
        developer_json = json_info['developers']
        dev_list = []
        for item in developer_json:
            dev_list.append({"url": item['url'], "name": item['name']})
        result['developers'] = dev_list
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # Languages
    try:
        lang_json = json_info['categories']['language']
        lang_list = []
        for item in lang_json:
            lang_list.append(item['fullname'])
        result['languages'] = lang_list
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # Licenses
    try:
        license_json = json_info['categories']['license']
        result['license'] = license_json[0]['fullname']
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    # Status
    try:
        status_json = json_info['categories']['developmentstatus']
        result['Development Status'] = status_json[0]['fullname']
    except Exception as e:
        print "Line number " + get_linenumber()
        print e

    return result


def get_date(doi):
    '''
    Get the date of the publication from crossref
    :param doi:
    :return:
    '''
    url = "http://api.crossref.org/works/"+str(doi)
    response = str(urllib.urlopen(url).read())
    parsed_json = json.loads(response)
    try:
        return parsed_json['message']['created']['date-time']
    except Exception as e:
        print "Line number " + get_linenumber()
        print e
        return None


def start_parsing(files):
    queue = Queue.Queue()
    for x in range(num_threads):
        worker = MasterClass(queue)
        worker.daemon = True
        worker.start()

    for file in files:
        queue.put(file)

    queue.join()


def read_doi_records(records):
    global dois
    global extract_doi
    try:
        with open(records, 'rU') as file:
            dois = json.loads(file.read())
    except Exception as e:
        print "Line number " + get_linenumber()
        print e
        extract_doi = True


def read_xml_from_file(file):
    filepath = xmlpath + file
    try:
        with codecs.open(filepath, "r", encoding='utf-8', errors='ignore') as f:
            read = f.read()
            return xmltodict.parse(read)
    except Exception as e:
        print "Could not open/parse file " + filepath
        print "Line number " + get_linenumber()
        print e


def read_text_from_file(file):
    # Read text of file.
    filepath = textPath + file[:-4] + ".txt"
    try:
        with codecs.open(filepath, "r", encoding='utf-8', errors='ignore') as f:
            text = f.read()
            return text.encode('utf-8')
    except Exception as e:
        print "Could not open file " + filepath
        print "Line number " + get_linenumber()
        print e


def get_agencies():
    with open(path+"/util/funding.json", "r") as file:
        parsed_json = json.load(file)
        for obj in parsed_json:
            agencies.add(obj['name'])
            for alias in obj['aliases']:
                agencies.add(alias)


def single_document_case(doi):
    '''
    Try grobid extraction over user input as it is more reliable. If grobid fails the user doi input value
    is still retained
    :param files:
    :param doi:
    :return:
    '''
    global single_case_doi
    global extract_doi
    extract_doi = True
    single_case_doi = doi


def main(XMLFiles, textFiles, correctDOIRecords, outfile, doi):
    global path
    path = sys.path[0]
    start_time = time.time()

    global textPath
    global xmlpath
    textPath = textFiles
    xmlpath = XMLFiles

    files = get_all_files(xmlpath)
    get_agencies()
    if correctDOIRecords is not None:
        read_doi_records(correctDOIRecords)
    elif doi is not None:
        single_document_case(doi)
    else:
        print "Please pass in doiRecords if multiple documents or doi if single document"
        sys.exit(1)
    start_parsing(files)

    write_records(outfile)
    print("Parsing grobid data:    --- %s seconds ---" % (time.time() - start_time))

if __name__ == '__main__':
    '''
    Default behaviour for web app since upload is always single file, pass in None as doiRecords
    4th parameter will be doi.
    '''
    main(sys.argv[1], sys.argv[2], None, sys.argv[3], sys.argv[4])

