#!/bin/bash

#### Check environment variables ####
check_if_exists () {
    if [[ -z "$1" ]]; then
        echo "$2 env variable is not set. Setting default value."
    fi
}

check_if_exists "$YJS" "YJS"
check_if_exists "$PORT" "PORT"
check_if_exists "$OIDC_CLIENT_ID" "OIDC_CLIENT_ID"
check_if_exists "$YJS_RESOURCE_PATH" "YJS_RESOURCE_PATH"
check_if_exists "$RASA_NLU" "RASA_NLU"
check_if_exists "$SBF_MANAGER" "SBF_MANAGER"
check_if_exists "$CONTACT_SERVICE_URL" "CONTACT_SERVICE_URL"

export YJS=${YJS:-localhost:1234}
export YJS_PROTOCOL=${YJS_PROTOCOL:-ws}
export YJS_RESOURCE_PATH=${YJS_RESOURCE_PATH:-/socket.io}

export PORT=${PORT:-80}
export OIDC_CLIENT_ID=${OIDC_CLIENT_ID:-localtestclient}
export RASA_NLU=${RASA_NLU:-http://localhost:5005}
export SBF_MANAGER=${SBF_MANAGER:-http://localhost:8080}
export CONTACT_SERVICE_URL=${CONTACT_SERVICE_URL:-http://localhost:8080}

##### App ####
cd app
cp config.json.sample config.json

sed -i "s=<OIDC_CLIENT_ID>=$OIDC_CLIENT_ID=g" config.json
sed -i "s=<YJS_PROTOCOL>=$YJS_PROTOCOL=g" config.json
sed -i "s=<YJS_ADDRESS>=$YJS=g" config.json
sed -i "s=<YJS_RESOURCE_PATH>=$YJS_RESOURCE_PATH=g" config.json
sed -i "s=<CONTACT_SERVICE_URL>=$CONTACT_SERVICE_URL=g" config.json
sed -i "s=<RASA_NLU>=$RASA_NLU=g" config.json
sed -i "s=<SBF_MANAGER_HOST>=$SBF_MANAGER=g" config.json

sed -i "s=localhost:1234=$YJS=g" /usr/src/app/app/node_modules/@rwth-acis/syncmeta-widgets/build/widgets/widget.container.js
sed -i "s=yjsProtocol = \"ws\"=wss=g" /usr/src/app/app/node_modules/@rwth-acis/syncmeta-widgets/build/widgets/widget.container.js


npm run build:prod
npm run node:prod
