#!/bin/bash

git pull origin dev
echo 8z4r3p8bdy | sudo -S forever restartall
#echo 8z4r3p8bdy | sudo -S su - <<'EOF'
#cd /home/developer/Aztec-web/web
#forever restartall
#forever start deploy_server.js
#EOF
