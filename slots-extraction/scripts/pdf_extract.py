import subprocess
from os import listdir
from os.path import isfile, join
from threading import Thread
import Queue
import time
import os
import sys

# This script extracts grobid xml data from downloaded pdf's

# GROBID has a bug which leads to internal server error when num_threads is more than 1.
# Set to one if conversion of every single document is a must, accuracy decreases as threads increase.

port = "8080"      # port number where the local grobid instance is running
num_threads = 2


class grobid_multi(Thread):
    '''
    Thread class to get XML from PDF
    '''
    def __init__(self, queue):
        Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            # Get the work from the queue
            inFilename, outFilename = self.queue.get()
            getXMLFromPDF(inFilename, outFilename)
            self.queue.task_done()


class XMLToTEIMulti(Thread):
    '''
    Thread class to convert XML to TEI format
    '''
    def __init__(self, queue):
        Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            # Get the work from the queue
            outFilename = self.queue.get()
            convertXMLToTEI(outFilename)
            self.queue.task_done()


class PDFToText(Thread):
    '''
    Thread class to convert pdfs to text
    '''
    def __init__(self, queue):
        Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            # Get the work from the queue
            inFileName, outFileName = self.queue.get()
            getRawText(inFileName, outFileName)
            self.queue.task_done()


def getAllFiles(path):
    mypath = path
    files = [f for f in listdir(mypath) if isfile(
        join(mypath, f)) and f.endswith(".pdf")]
    return files


def getXMLFromPDF(inFilename, outFilename):
    '''
    Grobid call to generate xml data file from pdf
    :param inFilename:
    :param outFilename:
    :return:
    '''
    try:
        subprocess.call(["curl",
                         "-v",
                         "-include",
                         "--form",
                         "input=@" + inFilename,
                         "localhost:" + port + "/processFulltextDocument",
                         "-o",
                         outFilename])
    except Exception as e:
        print e
        print "PDF to xml failed, continuing"


def convertXMLToTEI(outFilename):
    try:
        lines = open(outFilename).readlines()
        # Remove HTTP status message from XMLs and append TEI.
        open(outFilename, 'w').writelines(lines[7:-1])
        open(outFilename, 'a').writelines("</TEI>")
    except Exception as e:
        print e
        print "XML to TEI failed, continuing"


def getRawText(inFilename, outFilename):
    try:
        subprocess.call(["pdftotext", inFilename, outFilename])
    except Exception as e:
        print e
        print "PDF to Text failed"


def start_grobid(files, pdfpath, xmlpath):
    queue = Queue.Queue()
    for x in range(num_threads):
        worker = grobid_multi(queue)
        worker.daemon = True
        worker.start()

    for file in files:
        inFilename = pdfpath + file
        file = file.replace(".pdf", '')
        outFilename = xmlpath + file + ".xml"
        queue.put((inFilename, outFilename))

    queue.join()


def convert_xml(files, xmlpath):
    queue = Queue.Queue()
    for x in range(num_threads):
        worker = XMLToTEIMulti(queue)
        worker.daemon = True
        worker.start()

    for file in files:
        file = file.replace(".pdf", '')
        outFilename = xmlpath + file + ".xml"
        queue.put(outFilename)

    queue.join()


def convert_text(files, pdfpath, textPath):
    queue = Queue.Queue()
    for x in range(num_threads):
        worker = PDFToText(queue)
        worker.daemon = True
        worker.start()

    for file in files:
        inFilename = pdfpath + file
        file = file.replace(".pdf", '')
        outFilename = textPath + file + ".txt"
        queue.put((inFilename, outFilename))

    queue.join()


def main(pdfpath, outpathXML, outpathText):
    start_time = time.time()
    if not os.path.isdir(outpathText):
        os.makedirs(outpathText)
    if not os.path.isdir(outpathXML):
        os.makedirs(outpathXML)

    # Get all files in path:
    files = getAllFiles(pdfpath)

    start_grobid(files, pdfpath, outpathXML)

    convert_xml(files, outpathXML)

    # Make command line calls to extract raw text (NOT annotated):
    convert_text(files, pdfpath, outpathText)

    print(" Grobid extraction:    --- %s seconds ---" % (time.time() - start_time))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
