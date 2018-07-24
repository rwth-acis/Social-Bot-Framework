# Social-Bot-Framework

### Core Components:
* [las2peer-Social-Bot-Manager-Service](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service)
* [las2peer-TensorFlow-TextToText-Service](https://github.com/rwth-acis/las2peer-TensorFlow-TextToText-Service)
* [las2peer-TensorFlow-Classifier-Service](https://github.com/rwth-acis/las2peer-TensorFlow-Classifier-Service)

### External Dependencies:
* [ROLE-SDK](https://github.com/rwth-acis/ROLE-SDK)
* [y-websockets-server](https://github.com/y-js/y-websockets-server)
* [SyncMeta](https://github.com/rwth-acis/syncmeta)
* [MobSOS Data-Processing](https://github.com/rwth-acis/mobsos-data-processing)
* [MobSOS Success-Modeling](https://github.com/rwth-acis/mobsos-success-modeling)

### Docker
This repository provides a dockerfile with an example setup. The external dependencies and the core components are included. [Noracle](https://github.com/Distributed-Noracle) is used as an example service.
The docker container is built automatically and can be obtained with the following command:
```
docker pull rwthacis/social-bot-framework
```
To start the container it is important that some ports are opened: 
```
docker run -it --rm -p 1234:1234 -p 8073:8073 -p 8080:8080 -p 3000:3000 -p 9011:9011 -p 4200:4200 -p 8081:8081 --name sbf rwthacis/social-bot-framework
```
### Manual Setup

