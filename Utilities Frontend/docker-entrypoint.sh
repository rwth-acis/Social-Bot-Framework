#!/bin/bash

#### Check environment variables ####
ENV_VARIABLE_NOT_SET=false
check_if_exists () {
    if [[ -z "$1" ]]; then
        echo "$2 env variable is not set"
        ENV_VARIABLE_NOT_SET=true
    fi
}

export YJS=${YJS:-http://localhost:1234}
export PORT=${PORT:-80}
export YJS_RESOURCE_PATH=${YJS_RESOURCE_PATH:-/socket.io}
export OIDC_CLIENT_ID=${OIDC_CLIENT_ID:-localtestclient}


check_if_exists "$YJS" "YJS"
check_if_exists "$PORT" "PORT"
check_if_exists "$OIDC_CLIENT_ID" "OIDC_CLIENT_ID"
check_if_exists "$YJS_RESOURCE_PATH" "YJS_RESOURCE_PATH"

if [ "$ENV_VARIABLE_NOT_SET" = true ] ; then
    echo "Missing environment variables, exiting..."
    exit 1
fi
#### RASA_NLU and SBF_MANAGER are optional ####
check_if_exists "$RASA_NLU" "RASA_NLU"
check_if_exists "$SBF_MANAGER" "SBF_MANAGER"
check_if_exists "$CONTACT_SERVICE_URL" "CONTACT_SERVICE_URL"


#### Replace SBF Manager and Rasa-NLU URLs ####
sed -i "s={RASA_NLU}=$RASA_NLU=g" app/src/model-training.js 
sed -i "s={SBF_MANAGER}=$SBF_MANAGER=g" app/src/model-training.js
sed -i "s={SBF_MANAGER}=$SBF_MANAGER=g" syncmeta/widgets/src/js/bot_widget.js


##### App ####
cd app
cp config.json.sample config.json
sed -i "s=<SYNC_META_HOST>=$SYNC_META_HOST=g" config.json
sed -i "s=<OIDC_CLIENT_ID>=$OIDC_CLIENT_ID=g" config.json
sed -i "s=<YJS_ADDRESS>=$YJS=g" config.json
sed -i "s=<YJS_RESOURCE_PATH>=$YJS_RESOURCE_PATH=g" config.json
sed -i "s=<CONTACT_SERVICE_URL>=$CONTACT_SERVICE_URL=g" config.json

npm run build
npm run start
