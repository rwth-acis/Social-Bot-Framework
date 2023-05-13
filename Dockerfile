FROM node:16

ENV YJS_RESOURCE_PATH "/socket.io"
ENV PORT 8082

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install dos2unix

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app
RUN cp ./config.json.sample ./config.json

RUN npm ci 

WORKDIR /usr/src/app

RUN dos2unix docker-entrypoint.sh

EXPOSE ${PORT}

ENTRYPOINT [ "bash",  "/usr/src/app/docker-entrypoint.sh" ]