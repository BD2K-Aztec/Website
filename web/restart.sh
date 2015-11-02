#!/bin/bash

git pull origin dev
node_modules/forever/bin/forever stop server.js
node_modules/forever/bin/forever start server.js
