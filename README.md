##Server Setup

* Pull Repository
* Install [Nodejs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) to the system (Note: installing nodejs should automatically install npm)
* Install node modules: 

  ```
    cd web && npm install
  ```
* Docker Setup (see below)
* Installing [oauth python client for GoogleAnalytics](https://github.com/google/google-api-python-client):

  ```
    pip install --upgrade google-api-python-client
    
    pip install oauth2client==1.5.2
    
    pip install pyopenssl
  ```
* Install forever globally with npm:
```
  sudo npm -g install forever
```

* To start running the server, navigate to the From web folder and run: 

  ```
    forever start server.js
  ```
  
  If running on deployment server, run deploy_server.js instead of server.js to run with ssl security.

  Default app.json files are located in config. If changes are required, create a local version of app.json. DO NOT change app.release.json

## [JSDoc](https://github.com/jsdoc3/jsdoc)

Follow the commenting style described at https://google.github.io/styleguide/javascriptguide.xml#Comments and http://usejsdoc.org/. 

TO generate docs, run document.sh from the web folder.

## Docker Images Usage

Pull Aztec docker images to machine:
```
docker pull tanpatrick/aztec-solr:web

docker pull vincekyi/aztec-mongo:web

docker pull vincekyi/aztec-mysql:web

docker pull asgard/docker-grobid-service
```

Start docker images.

###[Solr](https://hub.docker.com/r/makuk66/docker-solr/)
```
docker run -d -p 8983:8983 -t tanpatrick/aztec-solr
```

###[MongoDB](https://hub.docker.com/r/vincekyi/aztec-mongo/)
```
docker run -d -p 27017:27017 vincekyi/aztec-mongo
```

###[MySQL](https://hub.docker.com/r/vincekyi/aztec-mysql/)
```
docker run -d -p 3306:3306 vincekyi/aztec-mysql
```

###[GROBID](https://hub.docker.com/r/asgard/docker-grobid-service/)
```
docker run -d -p 8081:8000 asgard/docker-grobid-service
```

### Updating Statistics Manually
* Direct browser to localhost:xxxx/resource/update to initialize statistics
* To place statistics in Mongo: 
  ```
    cd web && node scripts/insert_stats.js
  ```
  
### Updating Statistics Automatically with Cronjob
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
