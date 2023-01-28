FROM node:11

ENV YJS_RESOURCE_PATH "/socket.io"
ENV PORT 8070

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated --no-install-recommends supervisor git nginx dos2unix
RUN npm_config_user=root npm install -g bower grunt-cli grunt polymer-cli gulp

COPY docker/supervisorConfigs /etc/supervisor/conf.d

# # copy widgets
# COPY docker/widgets/_bot_widget.tpl /usr/src/app/syncmeta/widgets/src/widgets/partials/
# COPY docker/widgets/bot_widget.js /usr/src/app/syncmeta/widgets/src/js/
# overwrite debug widget template (js stays the same)
# COPY docker/widgets/_debug_widget.tpl /usr/src/app/syncmeta/widgets/src/widgets/partials/

# COPY docker/Gruntfile.js /usr/src/app/syncmeta/widgets/
# COPY docker/yjs-sync.js /usr/src/app/syncmeta/widgets/src/js/lib/

WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/app
RUN npm install 

WORKDIR /usr/src/app

COPY docker/docker-entrypoint.sh docker-entrypoint.sh
RUN dos2unix docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]