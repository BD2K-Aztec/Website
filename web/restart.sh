#!/bin/bash

git pull origin dev
node_modules/forever/bin/forever stop deploy_server.js
node_modules/forever/bin/forever start deploy_server.js
