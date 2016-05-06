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

* Pull Repository
* Install Nodejs and npm
* cd web && npm install
* cd scripts/bash and run install_graphviz
* Link nodejs to node command: ln -s /usr/bin/nodejs /usr/bin/node
* Start all docker images (see above)
* node_modules/forever/bin/forever start server.json
* Direct browser to /resource/update
* cd web and run: node scripts/insert_stats.js
* run pip install --upgrade google-api-python-client

##How To:

###Copy Files to Docker

http://stackoverflow.com/questions/22907231/copying-files-from-host-to-docker-container

sudo cp schema.xml /var/lib/docker/aufs/mnt/a3be2e5897bf48c36805f005cbd6a9a31878b02c25edbf71a782d929c689fa13/opt/solr-5.3.0/server/solr/BD2K/conf

###Input json file to Solr

curl 'http://localhost:8983/solr/BD2K/update/json?commit=true' --data-binary @file.json -H 'Content-type:application/json'

###View Files in Docker
http://stackoverflow.com/questions/28037802/docker-exec-failed-to-exec-exec-cd-executable-file-not-found-in-path

###Restart the Server

Move to Aztec-Web/web

Run the restart.sh script with sudo