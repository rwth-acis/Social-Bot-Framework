# Social-Bot-Framework


Core Components
--------
* [las2peer-Social-Bot-Manager-Service](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service)

External Dependencies
--------
* [y-websockets-server](https://github.com/y-js/y-websockets-server)
* [SyncMeta](https://github.com/rwth-acis/syncmeta)
* [MobSOS Data-Processing](https://github.com/rwth-acis/mobsos-data-processing)
* [MobSOS Success-Modeling](https://github.com/rwth-acis/mobsos-success-modeling)
* [Rasa](https://github.com/RasaHQ/rasa.git)

Backend Integration
--------
### Trigger
For the bot to be triggered, the service must send an appropriate [monitoring message](https://github.com/rwth-acis/mobsos-data-processing/wiki/Manual#2-monitor-a-service).
```json
{
    "serviceAlias": "",
    "functionName": "",
    "attributes":{}
}
```
The `serviceAlias` attribute should contain the alias given by the @ServicePath annotation. 
The `functionName`attribute should contain the name of the function. 
Any type of attributes (@PathParam/@QueryParam/@BodyParam) should be listed in the `attributes` attribute.
If the service uses [PoJo's](https://en.wikipedia.org/wiki/Plain_old_Java_object) the developer can make use of the [Gson library](https://github.com/google/gson). 



# SBF Utilities Frontend

This application provides helpers to interact with the Social Bot Manager service.

This frontend consists of the Bot Modeling and the NLU Model Training Helper. 

## Build and Run the Frontend
First build the Docker image
```
$ docker build -t rwthacis/sbf-utils .
```

Then you can start the container like this:
```
$ docker run -p 8070:8070 -e WEBHOST=<host_address> -e YJS=<yjs_address> -e OIDC_CLIENT_ID=<oidc_client_id> -e RASA_NLU=<rasa_server> -e SBF_MANAGER=<sbfmanager_address> -d rwthacis/sbf-utils
```
After container started to run, application will be accessible via http://127.0.0.1:8070

Application is using [YJS][yjs-github] for interwidget communication, therefore it needs [y-websocket-server][y-websocket-server] instance. 
It can be started with following command:
```
docker run -p 1234:1234  -d rwthacis/y-websockets-server
```
Then, address of y-websockets-server instance need to be passed to Docker container during initialization with `YJS` environment variable. If websocket server is started with previous command, its address will be `127.0.0.1:1234` and this value need to be passed to Docker container during initialization.


Following environment variables are needed to be passed to container during initialization:

* `WEBHOST`: Url address of application
* `YJS`: Root url address of Yjs websocket server. If it is running behind reverse proxy, relative path need to be provided with the `YJS_RESOURCE_PATH` env variable.
* `OIDC_CLIENT_ID`: OIDC client id which is used for authentication purpose. Client id can be acquired from Learning Layers after client registration

Following environment variables have default values however they can be changed during initialization:

* `PORT`: Port which Nginx server is listening locally. This port need to be made accessible to outside with port mapping during initialization. Default value is `8070`.
* `YJS_RESOURCE_PATH`: Resource path of Yjs websocker server. If websocket server running behind reverse proxy and `/yjs` path is redirected to websocket server, this env variable need to be `/yjs/socket.io`. Default value is `/socket.io`.
* `SBF_MANAGER`: Address of a running SBFManager Instance. If not empty, the given address will be written in the "SBFManager Endpoint" fields of the frontend.
* `RASA_NLU`: Address of a server hosting the NLU Model. If not empty, the given address will be written in the "Rasa NLU Endpoint" field of the NLU Model Training Helper.

[yjs-github]: https://github.com/yjs/yjs
[y-websocket-server]: https://github.com/y-js/y-websockets-server

# Deploying a Bot
After creating a bot model on the frontend, you will be able to upload the bot to the SBFManager by using the "Model Uploader" on the "Bot Modeling" page. For this to work, you will need a running instance of the [SBFManager](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service) and adjust the "SBFManager Endpoint" accordingly. 

When creating chatbots you will also need to provide a [Rasa server](https://github.com/RasaHQ/rasa.git) hosting a NLU Model. You can also use the "NLU Model Training Helper" to create your own NLU Model and upload that model by adjusting the "SBFManager Endpoint" and "Rasa NLU Endpoint" accordingly.

# Bot-modeling Guide
### A Bot's Basic Configuration
First, to be able to deploy the bot (on a running instance of the [SBFManager](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service), we will need to connect an Instance element to a Bot element with the "has" relation.   
![BotBasicConfiguration](READMEImages/BotBasicConfiguration.png)  
The Instance element will represent the las2peer instance on which our used services are running and on which our bot will be acting. For the attributes, an arbitrary name can be given and the address of the las2peer instance is also needed. There is also the optional attribute "Environment Separator", which can be used if multiple subcategories are defined in the instance. The Bot element will only need a name, with which the las2peer network will identify the created bot with.
When creating a Chatbot, some additional elements are needed. These will be the NLU Knowledge element and the Messenger element. The Bot element will use the "has" relation to connect to both of these elements.   
![ChatbotBasicConfiguration](READMEImages/ChatbotBasicConfiguration.png)   
The NLU Knowledge element represents the bot's used NLU Model(language model), thus the bot's vocabulary. As attributes, the NLU Knowledge element will need an arbitrary name, the address of the Rasa server hosting the NLU Model, and an ID to differentiate between multiple NLU Models, as a bot can possess multiple NLU Models. The Messenger element will represent the used communication platform, for which the platforms Slack and Rocket.Chat are currently available. After setting a platform as an attribute, an additional authentication token will be needed which should be provided by the platforms themselves.
### Modelling Chatbot-User Interaction
Now that we have a bot that is ready to be deployed, we still need to model the conversation itself. The SBF will allow us to create the bot's NLU Model, thus how it will interpret the user's messages and we will be able to let the bot respond with fitting messages depending on the user's message.  
First things first, the user will need to model the bot's NLU Model in the "NLU Model Training Helper" part of the SBF frontend. The Markdown format is used for creating the NLU Models and a precise tutorial can be found at [Rasa's official documentation](https://legacy-docs-v1.rasa.com/nlu/training-data-format/). Overrall, here the user will define the Intents the bot will be able to recognize based on given examples. To upload the NLU Model, the SBF Manager endpoint and the Rasa NLU Endpoint need to be adjusted accordingly. The model will first be trained and thus not be immediately available. One can check the training's state by pressing the "Check Training Status" button.    
The Incoming Message and Chat Response elements are used for modelling the conversation.  
 ![MessageModelling](READMEImages/MessageModelling.png)  
At the beginning of a conversation, the bot will wait for the user's message. After the bot receives a message on the chat platform, it will attempt to extract an Intent from the received message. The Incoming Message element will represent the user's messages and has an Intent attribute, which will contain the expected Intent. If the bot recognizes this Intent, the bot will go to this Incoming Message element and trigger the corresponding Chat Response. The Chat Response element thus represents the bot's response to user messages for which the concrete response can be written in the "Message" attribute field of the element.    
 For an easy example, lets say we modelled the bot to expect a greeting from the user and great them back. For that cause, the "greeting" Intent was defined in the NLU Model. Additionally, the Intent attribute of the Incoming Message element will contain "greeting" and the Chat Response's "Message" attribute will contain the message "Hello :)". If the user now greets the bot, the bot will extract the "greeting" Intent and jump to the fitting Incoming Message element and then greet the user back with "Hello :)".
An additional option is to let the bot use multiple Chat Response elements for one Incoming Message element. This would simply lead to the bot randomly choosing one of the available Chat Responses to give to the user, making the bot a bit more interactive.  
![MultipleMessageModelling](READMEImages/MultipleMessageModelling.png)  

Adding an Incoming Message with the Intent attribute set to "default" would lead to the bot giving out a default answer if it does not understand a message (i.e. having a low confidence when extracting the Intent).

### Modelling Chatbot-User Interaction: Creating a Conversation Path
After a first chat-interaction with the bot, there also is the possibility to create a conversation path, which will make the bot wait for specific Intents and trigger Chat Responses which could be triggered in this conversation path and not from the initial state of the conversation. To create a conversation path, the "leadsTo" relation can be used between Incoming Message elements, where the "label" attribute of the "leadsTo" relation must contain the follow up Intent.     

![communicationstate](READMEImages/leadsToModelling.png) 

The Intent attribute of the follow up Incoming Message elements can remain empty as the leadsTo relation will take care of forwarding the state. For these messages to be reachable from the initial state, the Messenger will again need to connect to these elements using the "generates" relation and the elements will also need to have the Intent attribute set. Once there is no follow up message the conversation path will be quit and the conversation will go back to the initial state. If no fitting Intent is recognized, the bot will simply send the default message.   
Continuing the previous greeting example, the user could have changed the bot's initial message to "Hello :), how was your day?". To model a fitting response, the user added the Intents "positiv" & "negativ", added new Incoming Message elements with the leadsTo relation and added Chat Responses with fitting answers. The bot would now, after asking the user about their day, expect a positiv or negativ answer and respond accordingly. 

### Create communication state with service
There is the possiblity to let users communicate and send messages to a specific triggered service for a certain period of time, depending on the service.
During this communication state the service will receive every user message and also have the possibility to communicate with the user. 
To model this you need to do the following:
- Have an incoming message object trigger a chat response object
- The chat response object will contain no message 
- The chat response object will be connect to a bot action object with the "uses" relation
- The bot action will now be the service with which the user will communicate

![communicationstate](READMEImages/communicationState.png)

The service will need to respond to the request with a json file containing the following data: 
```json
{
    "text": "",
    "closeContext": ""
}
```
The `text` attribute represents the service's response to the user.

The `closeContext` attribute is a boolean value which informs the Social Bot Manager if the communication state is to be maintained or stopped. (Note that, if no closeContext attribute is found, the communication state will automatically be stopped.)


### Start Menu

We have three basic dialogue elements that can be combined to model a dialogue. The Incoming Message that assigns chat responses to user intents, the Selection that gives the user responses to choose from, the Frame that generates an information collecting sub dialogue related to an action.

In the beginning of a dialogue the bot will introduce himself. Therefore the bot will generate a list of possible commands given by the frames and selections that are connected to the messenger or a domain. To use this the command name have to be defined in the element, otherwise the element is ignored.

### Frames 

![Basic Frame](READMEImages/Frame1.png)

The Frame needs to trigger a bot action. If a frame triggers a bot action it automatically recognizes its parameters (also non modeled parameters, if open API documentation is available). and creates a dialogue that tries to ask the user for the values of the parameters.
If there are modeled parameters that are also available in the OPENAPI they are merged. The modelled parameters ca be used to give further instructions to the dialogue generation.

![Frame with info function](READMEImages/Frame2.png)

If a parameter has a static content assigned, the bot will ignore the parameter during the dialogue. If a parameter is generated by a info function, the frame interprets the result of the info function as a list of possible values (like a selection). The label of the generates association defines the key to interpret the JSON response. The info function may have also parameters that need to be filled. If this is the case the Frame will include them into the dialogue.

One common design pattern would be to use the Info function to receive existing objects and use them in the bot action to alter one of this objects. Another design pattern would be to get the existing objects and use it as a filter in the request of another bot action. The info function may have

### Selection

![Basic Selection](READMEImages/Selection1.png)

The selection asks the user to choose from a collection of possible answers. It can be connected to one or multiple frames, messages, or further selections. It will generate the possible answers from the label of the associations to the other elements and trigger the element if the user chooses the respective input.

![Selection with Info Function](READMEImages/Selection2.png)

The selection can be connected to an info function, if this is the case the selection will create the possible answers from the response of the Info Function. You can define which section of a response JSON the selection should use by writing its Key on the label of the generates association.

![Selection fills parameter](READMEImages/Selection3.png)

The selected value of a Selection can be used to fill the Parameters of descendant attributes in the dialogue tree.



