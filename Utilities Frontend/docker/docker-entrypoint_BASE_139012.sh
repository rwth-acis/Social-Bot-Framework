#!/bin/bash

#### Check environment variables ####
ENV_VARIABLE_NOT_SET=false
check_if_exists () {
    if [[ -z "$1" ]]; then
        echo "$2 env variable is not set"
        ENV_VARIABLE_NOT_SET=true
    fi
}

check_if_exists "$WEBHOST" "WEBHOST"
check_if_exists "$YJS" "YJS"
check_if_exists "$PORT" "PORT"
check_if_exists "$OIDC_CLIENT_ID" "OIDC_CLIENT_ID"
check_if_exists "$YJS_RESOURCE_PATH" "YJS_RESOURCE_PATH"

if [ "$ENV_VARIABLE_NOT_SET" = true ] ; then
    echo "Missing environment variables, exiting..."
    exit 1
fi

#### Syncmeta ####
cd syncmeta/widgets
cp .localGruntConfig.json.sample .localGruntConfig.json
sed -i "s=http://localhost:8081=$WEBHOST/syncmeta=g" .localGruntConfig.json
sed -i "s=http://localhost:1234=$YJS=g" .localGruntConfig.json
sed -i "s=/socket.io=$YJS_RESOURCE_PATH=g" .localGruntConfig.json
grunt build
cd ../..

##### CAE App ####
cd app
cp config.json.sample config.json
sed -i "s=<WEBHOST>=$WEBHOST=g" config.json
sed -i "s=<OIDC_CLIENT_ID>=$OIDC_CLIENT_ID=g" config.json
sed -i "s=<YJS_ADDRESS>=$YJS=g" config.json
sed -i "s=<YJS_RESOURCE_PATH>=$YJS_RESOURCE_PATH=g" config.json
npm run build
cd ..

##### Nginx ####
cp docker/nginx.conf /etc/nginx/conf.d/default.conf
sed -i "s=<port>=$PORT=g" /etc/nginx/conf.d/default.conf
/etc/init.d/nginx start

#### Supervisor ####
/usr/bin/supervisord -n
