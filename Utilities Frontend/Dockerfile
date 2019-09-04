FROM node:12

WORKDIR /html

COPY . .

RUN npm install http-server -g

EXPOSE 80

CMD ["http-server", "-p 80", "--cors"]

