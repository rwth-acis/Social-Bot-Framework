FROM node:12

ENV YJS_RESOURCE_PATH "/socket.io"
ENV PORT 8070

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated --no-install-recommends supervisor git nginx dos2unix
RUN npm_config_user=root npm install -g bower grunt-cli grunt polymer-cli gulp

COPY docker/supervisorConfigs /etc/supervisor/conf.d

RUN git clone https://github.com/rwth-acis/syncmeta.git

# TODO: Use master branch
WORKDIR /usr/src/app/syncmeta
RUN git checkout develop && cd widgets && rm package-lock.json && npm install && bower install --allow-root

WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/app
RUN npm install && bower install --allow-root

WORKDIR /usr/src/app

COPY docker/docker-entrypoint.sh docker-entrypoint.sh
RUN dos2unix docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
