#!/bin/bash

#### Check environment variables ####
check_if_exists () {
    if [[ -z "$1" ]]; then
        echo "$2 env variable is not set. Setting default value."
    fi
}

check_if_exists "$PORT" "PORT"
check_if_exists "$OIDC_CLIENT_ID" "OIDC_CLIENT_ID"
check_if_exists "$YJS_HOST" "YJS_HOST"
check_if_exists "$YJS_PROTOCOL" "YJS_PROTOCOL"
check_if_exists "$YJS_PORT" "YJS_PORT"
check_if_exists "$YJS_RESOURCE_PATH" "YJS_RESOURCE_PATH"
check_if_exists "$RASA_NLU" "RASA_NLU"
check_if_exists "$SBF_MANAGER" "SBF_MANAGER"
check_if_exists "$CONTACT_SERVICE_URL" "CONTACT_SERVICE_URL"

#### Set default values ####
export YJS_HOST=${YJS_HOST:-localhost}
export YJS_PORT=${YJS_PORT:-1234}
export YJS_PROTOCOL=${YJS_PROTOCOL:-ws}
export YJS_RESOURCE_PATH=${YJS_RESOURCE_PATH:-/socket.io}

export PORT=${PORT:-8082}
export OIDC_CLIENT_ID=${OIDC_CLIENT_ID:-localtestclient}
export RASA_NLU=${RASA_NLU:-http://localhost:5005}
export SBF_MANAGER=${SBF_MANAGER:-http://localhost:8080}
export CONTACT_SERVICE_URL=${CONTACT_SERVICE_URL:-http://localhost:8080}
export BASE_HREF=${BASE_HREF:-/}

cp config.json.sample config.json

sed -i "s=<OIDC_CLIENT_ID>=$OIDC_CLIENT_ID=g" config.json
sed -i "s=<YJS_PROTOCOL>=$YJS_PROTOCOL=g" config.json
sed -i "s=<YJS_HOST>=$YJS_HOST=g" config.json
sed -i "s=<YJS_PORT>=$YJS_PORT=g" config.json
sed -i "s=<YJS_RESOURCE_PATH>=$YJS_RESOURCE_PATH=g" config.json
sed -i "s=<CONTACT_SERVICE_URL>=$CONTACT_SERVICE_URL=g" config.json
sed -i "s=<RASA_NLU>=$RASA_NLU=g" config.json
sed -i "s=<SBF_MANAGER_HOST>=$SBF_MANAGER=g" config.json

# find <base href="" /> and replace with the value of BASE_HREF
if [[ -n "$BASE_HREF" ]]; then
    sed -i "s=<base href=\"\" />=<base href=\"$BASE_HREF\" />=g" dist/index.html
fi

npm run build:prod
npm run node:prod
