#!/bin/bash

git pull origin dev
node_modules/forever/bin/forever stopall
node_modules/forever/bin/forever start deploy_server.js
