#FROM mhart/alpine-node
FROM tensorflow/tensorflow:latest-py3
MAINTAINER "neumann@dbis.rwth-aachen.de"

EXPOSE 3306 

# Urls
ENV DOCKER_URL http://192.168.2.101
ENV MICROSERVICE_PORT 9011
ENV HTTP_PORT 8080

# Let the container know that there is no tty
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update

EXPOSE 18080
# Install OpenJDK 8
RUN apt-get install -y --no-install-recommends software-properties-common
RUN add-apt-repository -y ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk
RUN apt-get install -y openjdk-8-jre
RUN update-alternatives --config java
RUN update-alternatives --config javac
RUN apt-get install -y wget

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y --no-install-recommends supervisor screen nodejs g++ git ant maven make bash net-tools

# MySQL

RUN apt-get update && apt-get install -y perl pwgen --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys A4A9406876FCBD3C456770C88C718D3B5072E1F5

ENV MYSQL_MAJOR 5.7
ENV MYSQL_VERSION 5.7.*

RUN echo "deb http://repo.mysql.com/apt/debian/ jessie mysql-${MYSQL_MAJOR}" > /etc/apt/sources.list.d/mysql.list

RUN { \
		echo mysql-community-server mysql-community-server/data-dir select ''; \
		echo mysql-community-server mysql-community-server/root-pass password ''; \
		echo mysql-community-server mysql-community-server/re-root-pass password ''; \
		echo mysql-community-server mysql-community-server/remove-test-db select false; \
	} | debconf-set-selections \
	&& apt-get update && apt-get install -y mysql-server="${MYSQL_VERSION}" && rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/lib/mysql && mkdir -p /var/lib/mysql


RUN npm install -g http-server bower grunt-cli grunt
    
#Debian node naming issue
#RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm i npm@latest -g

# --unsafe-perm fixes gyp issue
RUN apt-get update && apt-get -y install python2.7-dev
RUN npm install -g --unsafe-perm y-websockets-server
	
#Create file structure
RUN mkdir web

######### ROLE ##########
#RUN mkdir source && \
#	mkdir ROLE && \
#	cd source && \
#	git clone https://github.com/rwth-acis/ROLE-SDK.git && \
#	cd ROLE-SDK && \
	#git checkout tags/v10.2 -b localBuildBranch && \
#	git checkout develop  && \
#	mvn clean package && \
#	cp assembly/target/role-m10-sdk.tar.gz /ROLE/role.tar.gz && \
#	cd /ROLE && \
#	tar -xzf role.tar.gz && \
#	rm role.tar.gz

######## syncmeta ###########
RUN mkdir /source && \
	cd /source && \
	git clone https://github.com/rwth-acis/syncmeta.git && \
	git clone https://github.com/rwth-acis/RoleApiJS.git && \
	cd RoleApiJS && \
	git checkout develop && \
	npm install && \
	npm run buildNode && \
	cd ../syncmeta && \
	npm install && \
	bower install --allow-root && \
	cp .localGruntConfig.json.sample .localGruntConfig.json && \
	cp .dbis.secret.json.sample .dbis.secret.json && \
	grunt build
########################
#COPY mobsos-data-processing mobsos-data-processing
######## MobSOS #############

WORKDIR /

RUN git clone https://github.com/rwth-acis/mobsos-data-processing.git && \
	cd mobsos-data-processing && git checkout SocialBotFramework && \
	ant jar && \
	cd ..
RUN git clone https://github.com/rwth-acis/mobsos-success-modeling.git && \
	cd mobsos-success-modeling && git checkout SocialBotFramework && \
	ant jar && \
	cd ..
# Noracle
RUN git clone https://github.com/Distributed-Noracle/Distributed-Noracle-Backend.git && \
	cd Distributed-Noracle-Backend && \
	ant jar && \
	cd ..
RUN git clone https://github.com/Distributed-Noracle/Distributed-Noracle-Frontend.git && \
	cd Distributed-Noracle-Frontend && \
	npm install && \
	cd .. 
#SBF
RUN git clone https://github.com/rwth-acis/Social-Bot-Manager.git && \
	cd Social-Bot-Manager && \
	ant jar && \
	cd .. 
RUN git clone https://github.com/rwth-acis/las2peer-TensorFlow-TextToText.git && \
	cd las2peer-TensorFlow-TextToText && \
	ant jar && \
	cd python && wget http://las2peer.dbis.rwth-aachen.de/sbf/model.tar.gz && \
	tar -xzf model.tar.gz && \
	rm model.tar.gz && \
	cd .. 
RUN git clone https://github.com/rwth-acis/las2peer-TensorFlow-Classifier.git && \
	cd las2peer-TensorFlow-Classifier && \
	ant jar && \
	cd ..

RUN mkdir /ROLE && cd /ROLE && wget http://las2peer.dbis.rwth-aachen.de/sbf/role-m10-sdk.tar.gz

RUN cd /ROLE && \
	tar -xzf role-m10-sdk.tar.gz && \
	rm role-m10-sdk.tar.gz


COPY opt /opt

RUN cd /opt/configserver && \
	npm audit fix && \
	npm install && \
	cp /source/RoleApiJS/lib/roleApiJS.js roleApiJS.js

RUN chmod +x /opt/startup.sh

# python deps 
RUN pip install numpy colorama regex python-Levenshtein requests h5py==2.8.0rc1

# Copy supervisor config

COPY configs /etc/supervisor/conf.d
RUN rm /etc/supervisor/conf.d/dataProcessing.properties
COPY mysql.cnf /etc/mysql/my.cnf
COPY configs/dataProcessing.properties /mobsos-data-processing/etc/i5.las2peer.services.mobsos.dataProcessing.MonitoringDataProcessingService.properties

COPY widgets /widgets
RUN cd /widgets && sh build.sh

COPY opt/syncmeta /source/syncmeta
#Dashboard
EXPOSE 3000
EXPOSE 3306
#ROLE
EXPOSE 8073
#y-js websocket server
EXPOSE 1234
#Webconnector
EXPOSE 8080
#Webconnector
EXPOSE 9082
#Bootstrap node
EXPOSE 9011
#noracle node
EXPOSE 4200
#syncmeta
EXPOSE 8081


RUN chmod -R 755 /var/run/mysqld/
RUN chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

ENTRYPOINT ["/opt/startup.sh"]
#CMD "bash"
