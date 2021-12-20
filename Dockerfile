FROM node:10

ENV YJS_RESOURCE_PATH "/yjs/socket.io"
ENV PORT 8070
ENV SYNC_META_HOST http://127.0.0.1:8070
ENV YJS https://sbf.tech4comp.dbis.rwth-aachen.de
ENV OIDC_CLIENT_ID a7ece4a9-0a43-4fda-a33b-9c24a5a0d8f2


WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated --no-install-recommends supervisor git nginx dos2unix
RUN npm_config_user=root npm install -g grunt-cli grunt gulp

ARG src="Utilities Frontend/docker/supervisorConfigs"
ARG srx="Utilities Frontend"
COPY ${src} /etc/supervisor/conf.d

WORKDIR /usr/src/app
COPY ${srx}/syncmeta syncmeta

WORKDIR /usr/src/app/syncmeta
RUN npm install
RUN cp -a node_modules/@rwth-acis/syncmeta-widgets/. widgets/
RUN cp -a node_modules/. widgets/node_modules/
# copy widgets
COPY ${srx}/docker/widgets/_bot_widget.tpl /usr/src/app/syncmeta/widgets/src/widgets/partials/
COPY ${srx}/docker/widgets/bot_widget.js /usr/src/app/syncmeta/widgets/src/js/
# overwrite debug widget template to use slim version (js stays the same)
COPY ${srx}/docker/widgets/_debug_widget.tpl /usr/src/app/syncmeta/widgets/src/widgets/partials/
# overwrite attribute widget
COPY ${srx}/docker/widgets/attribute_widget /usr/src/app/syncmeta/widgets/src/templates/attribute_widget
# overwrite activity widget
COPY ${srx}/docker/widgets/activity_widget /usr/src/app/syncmeta/widgets/src/templates/activity_widget
# overwrite widget template to use bootstrap. This can be removed as soon as PR for bootstrap is merged in syncmetaf
COPY ${srx}/docker/widgets/widget.html.tpl /usr/src/app/syncmeta/widgets/src/widgets/
# overwrite styles
COPY ${srx}/docker/widgets/css /usr/src/app/syncmeta/widgets/src/css/

COPY ${srx}/docker/Gruntfile.js /usr/src/app/syncmeta/widgets/
COPY ${srx}/docker/yjs-sync.js /usr/src/app/syncmeta/widgets/src/js/lib/
WORKDIR /usr/src/app/syncmeta
RUN cd widgets && npm install

WORKDIR /usr/src/app
COPY ${srx} .
WORKDIR /usr/src/app/app
ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
RUN npm install

WORKDIR /usr/src/app
ARG srt="Utilities Frontend/docker/docker-entrypoint.sh"
COPY ${srt} docker-entrypoint.sh
RUN dos2unix docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
EXPOSE ${PORT}
