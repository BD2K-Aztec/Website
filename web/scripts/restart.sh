#!/bin/bash

git pull origin dev
echo -e "8z4r3p8bdy\n" | sudo -S su - <<'EOF'
cd /home/developer/Aztec-web/web
forever stopall
forever start deploy_server.js
EOF
