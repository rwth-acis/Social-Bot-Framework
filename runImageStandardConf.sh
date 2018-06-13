#!/bin/sh
docker run -it --rm -p 1234:1234 -p 8073:8073 -p 8080:8080 -p 3000:3000 -p 9011:9011 -p 4200:4200 -p 8081:8081 --name sbf sbf
