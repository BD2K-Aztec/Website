##Docker Images Usage

###[Solr](https://hub.docker.com/r/makuk66/docker-solr/)

docker run -d -p 8983:8983 -t tanpatrick/aztec-solr

###[Neo4j](https://hub.docker.com/r/tpires/neo4j/)

docker run -i -t -d --name neo4j --cap-add=SYS_RESOURCE -v /var/lib/neo4j/data -p 7474:7474 tanpatrick/aztec-neo4j

###[MongoDB](https://hub.docker.com/r/vincekyi/aztec-mongo/)

docker run -d -p 27017:27017 vincekyi/aztec-mongo

###[MySQL](https://hub.docker.com/r/vincekyi/aztec-mysql/)

docker run -d -p 3306:3306 vincekyi/aztec-mysql

##Server Setup

* Pull Repository to the home folder (i.e.  cd ~)
* Install Nodejs and npm to the system
* cd web && npm install
* Start all docker images (see above)
* From web folder, run: forever start server.js or deploy_server.js (note: deploy_server contains ssl certificates. For local system, use server.js)
* Note: Default app.json files are located in config. 
* Direct browser to /resource/update
* cd web and run: node scripts/insert_stats.js
* run pip install --upgrade google-api-python-client
* sudo pip install oauth2client==1.5.2
* sudo pip install pyopenssl

### Updating Statistics Automatically
* Navigate to the updateStats script in web/scripts
* Change the file path to direct to the insert_stats.js file in the scripts file (path may change depending on the system) 
* Set up a cronjob for the updateStats script. (i.e. For linux-based systems, copy the file to /var/cron.daily)

##How To:

###Copy Files to Docker

http://stackoverflow.com/questions/22907231/copying-files-from-host-to-docker-container

###Input json file to Solr

curl 'http://localhost:8983/solr/BD2K/update/json?commit=true' --data-binary @file.json -H 'Content-type:application/json'

###View Files in Docker
http://stackoverflow.com/questions/28037802/docker-exec-failed-to-exec-exec-cd-executable-file-not-found-in-path

###Restart the Server

Move to Aztec-Web/web/scripts

Run the restart.sh script with sudo