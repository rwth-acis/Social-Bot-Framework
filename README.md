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

First of all, the external dependencies must be running. 
To model the bot you need a ROLE space on which the SyncMeta widgets run. 
With the debug widget you can then load the [vls](MetaModel/vls.json). 
To load the model into the network, the [model selector widget](widgets/src/widgets/models.xml) must be added. The [method browser](widgets/src/widgets/methods.xml) can be used as an assistant. 
To use the widgets, the urls have to be adapted and the bower dependencies have to be installed. 
It is important that the location of the ROLE space is set in the Access-Control-Allow-Origin header.
The core components must run on the same network as the MobSOS services. 

### Frontend Integration
Within the service frontend two links must be provided to use the framework. 
1. Post request to add the bot to a unit 

JavaScript
```JavaScript
function addToUnit(){
    var xhr = new XMLHttpRequest();
    var webConnectorEndpoint = "http://localhost:8080/";
    var url = webConnectorEndpoint + "SBFManager/join";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Bot added");
        }
    };
    var data = JSON.stringify({basePath: webConnectorEndpoint + "serviceAlias", joinPath:"serviceFunctionPath"});
    xhr.send(data);
}
```
HTML
```html
<a onclick="addToUnit()">Add Bot to Unit</a>
```
You have to adjust the `webConnectorEndpoint`, the `serviceAlias` and the `serviceFunctionPath`. If the service needs any further parameters they can be added to the body of the post request.
If the service has no unit separation you can add the following attribut to the body: 
```json
"directJoin": true
```
2. Url for the training area
```html
<a href="{{urlToWidget}}/train.html?unit={{unit}}">Train Bot</a>
```
You have to adjust the `urlToWidget` and the `unit`. If the service has no unit separation the unit query parameter can then be omitted. 
