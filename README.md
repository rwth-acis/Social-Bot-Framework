<p align="center">
  <img src="Logos/sbf-logo.svg" width=400px/>
</p>
<p align="center">
        <a href="https://github.com/rwth-acis/Social-Bot-Framework/blob/master/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/github/license/rwth-acis/Social-Bot-Framework.svg?color=blue">
        </a>
        <a href="https://github.com/rwth-acis/Social-Bot-Framework/releases">
        <img alt="GitHub release" src="https://img.shields.io/github/release/rwth-acis/Social-Bot-Framework.svg">
    </a>
</p>

A Web-based, model-driven framework for creating social bots for RESTful web applications. Check out the [wiki](https://github.com/rwth-acis/Social-Bot-Framework/wiki) for more information about the modeling language and tutorials on creating bots with the framework.

## Core Components

* [las2peer-Social-Bot-Manager-Service](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service)

### External Dependencies

* [y-websockets-server](https://github.com/y-js/y-websockets-server)
* [SyncMeta](https://github.com/rwth-acis/syncmeta)
* [MobSOS Data-Processing](https://github.com/rwth-acis/mobsos-data-processing)
* [MobSOS Success-Modeling](https://github.com/rwth-acis/mobsos-success-modeling)
* [Rasa](https://github.com/RasaHQ/rasa.git)

## SBF Utilities Frontend

This application provides helpers to interact with the Social Bot Manager service.

This frontend consists of the Bot Modeling and the NLU Model Training Helper.

### Build and Run the Frontend

First, build the Docker image. Please note that the frontend can onyl be built using node versions <=11

```bash
$ docker build -t rwthacis/sbf-utils .
```

Then you can start the container like this:

```bash
$ docker run -p 8070:8070 -e SYNC_META_HOST=<host_address> -e YJS=<yjs_address> -e OIDC_CLIENT_ID=<oidc_client_id> -e RASA_NLU=<rasa_server> -e SBF_MANAGER=<sbfmanager_address> -d rwthacis/sbf-utils
```

After the container started to run, the application will be accessible via http://127.0.0.1:8070 . Make sure **not** to use `localhost` as you will run into cors issues when loading ressources from Syncmeta.

Application is using [YJS][yjs-github] for interwidget communication, therefore it needs [y-websocket-server][y-websocket-server] instance.
It can be started with the following command:

```bash
$ docker run -p 1234:1234  -d rwthacis/y-websockets-server
```

Then, the address of y-websockets-server instance needs to be passed to Docker container during initialization with `YJS` environment variable. If the WebSocket server is started with the previous command, its address will be `127.0.0.1:1234` and this value needs to be passed to Docker container during initialization.

Following environment variables are needed to be passed to the container during initialization:

* `SYNC_META_HOST`: Url address of application
* `YJS`: Root URL address of Yjs WebSocket server. If it is running behind a reverse proxy, a relative path needs to be provided with the `YJS_RESOURCE_PATH` env variable.
* `OIDC_CLIENT_ID`: OIDC client id which is used for authentication purposes. Client id can be acquired from Learning Layers after client registration

Following environment variables have default values however they can be changed during initialization:

* `PORT`: Port which Nginx server is listening locally. This port need to be made accessible to the outside with port mapping during initialization. The default value is `8070`.
* `YJS_RESOURCE_PATH`: Resource path of Yjs WebSocket server. If the WebSocket server is running behind a reverse proxy and the `/yjs` path is redirected to the WebSocket server, this env variable needs to be `/yjs/socket.io`. The default value is `/socket.io`.
* `SBF_MANAGER`: Address of a running SBFManager Instance. If not empty, the given address will be written in the "SBFManager Endpoint" fields of the frontend.
* `RASA_NLU`: Address of a server hosting the NLU Model. If not empty, the given address will be written in the "Rasa NLU Endpoint" field of the NLU Model Training Helper.

[yjs-github]: https://github.com/yjs/yjs
[y-websocket-server]: https://github.com/y-js/y-websockets-server

## Examples

| Bot            | Description                                                                                                                                                                                  | Application                                                                                                                                                | Demo                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| MensaBot       | Bot used to fetch and rate menu for canteens.                                                                                                                                                | [las2peer-Mensa-Service](https://github.com/rwth-acis/las2peer-Mensa-Service)                                                                              | [Telegram](https://t.me/AcisMensaBot)                                                |
| SurveyBot      | Conducts surveys in chat, including getting the survey information, sending reminders and passing user results back to the survey instance.                                                  | [Survey-Handler-Service](https://github.com/rwth-acis/Survey-Handler-Service), [MobSOS Surveys](https://github.com/rwth-acis/mobsos-surveys) or LimeSurvey | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/surveybot)            | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/la-verification-bot) |
| FeedBot        | Gives out assignments to users, takes in their written solution and utilizes T-MITOCAR to compare it with a master solution. Does not give a grade but returns a feedback file where the comparison is discussed. | [las2peer-T-MITOCAR-Service](https://github.com/rwth-acis/las2peer-tmitocar-service)                                                                       | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/BiWi-FeedBot)        |
| ReaderbenchBot | Gives out assignments to users, takes in their written solution and utilizes Readerbench to compare it with a master solution. Does not give a grade but returns a feedback file where the comparison is discussed.                                                                                                                                                                                         | [las2peer-readerbench](https://github.com/rwth-acis/las2peer-readerbench)                                                                                  | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/readerbot)           |
| LitBot         | Supports students with reading seminar texts. Conducts small exercises with students and proposes additional tips, tools and learning material for before and after reading the texts. Also does recommendations based on the read texts.                                                                                                                                                                                        | [las2peer-akg](https://github.com/rwth-acis/las2peer-akg)                                                                                                  | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/BiWi-LitBot)         |
| LA-Bot         | Verifies a student's consent and manages it via blockchain. Continuing learner activities are verified and can be queried.                                                                                                                                                                                         | [learning-analytics-verification](https://github.com/rwth-acis/learning-analytics-verification)                                                            | [Rocket.Chat](https://chat.tech4comp.dbis.rwth-aachen.de/direct/la-verification-bot) |
| CitBot         | Finds references for text passages or for keywords. Manages marked literature and offers an export.                                                                                                                                                                                         | [Citation-Recommendation-Bot](https://github.com/rwth-acis/Citation-Recommendation-Bot)                                                                    | Slack - Contact us                                                                                 |

## Deploying a Bot

After creating a bot model on the frontend, you will be able to upload the bot to the SBFManager by using the "Model Uploader" on the "Bot Modeling" page. For this to work, you will need a running instance of the [SBFManager](https://github.com/rwth-acis/las2peer-Social-Bot-Manager-Service) and adjust the "SBFManager Endpoint" accordingly.

When creating chatbots you will also need to provide a [Rasa server](https://github.com/RasaHQ/rasa.git) hosting an NLU Model. You can also use the "NLU Model Training Helper" to create your own NLU Model and upload that model by adjusting the "SBFManager Endpoint" and "Rasa NLU Endpoint" accordingly.

To find out how to model bots, you can check the [SBF wiki](https://github.com/rwth-acis/Social-Bot-Framework/wiki).

## References

1. Neumann, Alexander Tobias, Tamar Arndt, Laura Köbis, Roy Meissner, Anne
Martin, Peter de Lange, Norbert Pengel, Ralf Klamma, and Heinz-Werner
Wollersheim. 2021. “Chatbots as a Tool to Scale Mentoring Processes:
Individually Supporting Self-Study in Higher Education.” *Frontiers in
Artificial Intelligence* 4: 64–71.
<https://doi.org/10.3389/frai.2021.668220>.

2. Neumann, Alexander Tobias, Peter de Lange, Ralf Klamma, Norbert Pengel,
and Tamar Arndt. 2021. “Intelligent Mentoring Bots in Learning
Management Systems: Concepts, Realizations and Evaluations.” In
*Learning Technologies and Systems*, edited by Chaoyi Pang, Yunjun Gao,
Guanliang Chen, Elvira Popescu, Lu Chen, Tianyong Hao, Bailing Zhang,
Silvia Margarita Baldiris Navarro, and Qing Li, 12511:3–14. Lecture
Notes in Computer Science. \[S.l.\]: Springer.
[https://doi.org/10.1007/978-3-030-66906-5_1](https://doi.org/10.1007/978-3-030-66906-5_1).

3. Neumann, Alexander Tobias, Peter de Lange, and Ralf Klamma. 2019.
“Collaborative Creation and Training of Social Bots in Learning
Communities.” In *2019 IEEE 5th International Conference on
Collaboration and Internet Computing (CIC)*, 11–19. IEEE.
<https://doi.org/10.1109/CIC48465.2019.00011>.
