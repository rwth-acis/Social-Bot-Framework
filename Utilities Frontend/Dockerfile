FROM node:16

ENV YJS_RESOURCE_PATH "/socket.io"
ENV PORT 8082

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated --no-install-recommends supervisor git dos2unix

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/app
RUN cp ./config.json.sample ./config.json

RUN npm install 

WORKDIR /usr/src/app
EXPOSE ${PORT}

RUN dos2unix docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]