docker

looking around
http://stackoverflow.com/questions/28037802/docker-exec-failed-to-exec-exec-cd-executable-file-not-found-in-path



solr https://hub.docker.com/r/makuk66/docker-solr/

SOLR_CONTAINER=$(docker run -d -p 8983:8983 -t makuk66/docker-solr) #aztec-solr

copy schema file and config file
http://stackoverflow.com/questions/22907231/copying-files-from-host-to-docker-container
sudo cp schema.xml /var/lib/docker/aufs/mnt/**/var/lib/docker/aufs/mnt/**a3be2e5897bf48c36805f005cbd6a9a31878b02c25edbf71a782d929c689fa13**/opt/solr-5.3.0/server/solr/BD2K/conf


cd ~/solr
./ctlscript service start | restart | stop

input 
curl 'http://localhost:8983/solr/BD2K/update/json?commit=true' --data-binary @solr.json -H 'Content-type:application/json'

neo4j https://hub.docker.com/r/tpires/neo4j/

copy over database
docker run -i -t -d --name neo4j --cap-add=SYS_RESOURCE -v /var/lib/neo4j/data -p 7474:7474 tpires/neo4j

#/var/lib/neo4j/bin/neo4j start



docker run -p 27017:27017 -d tanpatrick/aztec-mongo --noprealloc --smallfiles

docker run -i -t -p 80:3000 tanpatrick/aztec-server