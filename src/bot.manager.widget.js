import { html, LitElement } from "lit";
import _ from "lodash-es";
import { getGuidanceModeling } from "@rwth-acis/syncmeta-widgets/src/es6/Guidancemodel";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { Text as YText, Map as YMap } from "yjs";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import config from "../config.json";
import { Common } from "./common.js";

const keyboardEnterPrevent = {
  bindings: {
    shift_enter: {
      key: 13,
      shiftKey: true,
      handler: () => {},
    },
    enter: {
      key: 13,
      handler: () => {},
    },
  },
};

class BotManagerWidget extends LitElement {
  storeNameInputEditor;
  sbfManagerEndpointEditor;
  botModels = [];

  guidance = null;
  constructor() {
    super();
  }
  createRenderRoot() {
    return this;
  }

  async updateMenu() {
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoomName(),
    });
    const y = await instance.connect();
    var xhr = new XMLHttpRequest();
    var endpoint = y.getText("sbfManager").toString();
    xhr.open("GET", endpoint + "/models/");
    xhr.onload = () => {
      if (xhr.status == 200) {
        var models;
        try {
          models = JSON.parse(xhr.response);
        } catch (e) {
          console.error("error while parsing models", e);
          return;
        }
        Object.values(models).forEach((model) => {
          if (!this.botModels.includes(model)) {
            const loadNameInput = document.querySelector("#loadNameInput");
            const option = document.createElement("option");
            option.value = model;
            option.text = model;
            loadNameInput.appendChild(option);
            this.botModels.push(model);
          }
        });
      }
    };
    xhr.send(null);
  }

  loadModel() {
    var name = document.querySelector("#storeNameInput").val();
    var endpoint = window.y.getText("sbfManager").toString();
    var loadStatus = $("#loadStatus");
    const spinner = $("#loadStatusSpinner");
    const btn = $("#load-model");
    $(loadStatus).text("Loading...");
    spinner.show();
    btn.prop("disabled", true);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      alert("The model was successfully loaded.");
      cleanStatus("loadStatus");
      spinner.hide();
      btn.prop("disabled", false);
    });
    xhr.addEventListener("error", () => {
      alert("The model could not be loaded.");
      cleanStatus("loadStatus");
      spinner.hide();
      btn.prop("disabled", false);
    });
    xhr.open("GET", endpoint + "/models/" + name);
    xhr.responseType = "json";
    xhr.onload = function () {
      var data = xhr.response;
      if (data && name) {
        var initAttributes = function (attrs, map) {
          if (attrs.hasOwnProperty("[attributes]")) {
            var attr = attrs["[attributes]"].list;
            for (var key in attr) {
              if (attr.hasOwnProperty(key)) {
                if (attr[key].hasOwnProperty("key")) {
                  var ytext = map.set(attr[key].key.id, new YText());
                  ytext.insert(0, attr[key].key.value);
                } else {
                  var ytext = map.set(attr[key].value.id, new YText());
                  ytext.insert(0, attr[key].value.value);
                }
              }
            }
          } else {
            for (var key in attrs) {
              if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value;
                if (!value.hasOwnProperty("option")) {
                  if (value.value instanceof String) {
                    var ytext = map.set(value.id, new YText());
                    ytext.insert(0, value.value);
                  }
                }
              }
            }
          }
        };
        if (this.guidance.isGuidanceEditor())
          y.getMap("data").set("guidancemodel", data);
        else y.getMap("data").set("model", data);
        for (var key in data.nodes) {
          if (data.nodes.hasOwnProperty(key)) {
            var entity = data.nodes[key];
            var map = y.getMap("nodes").set(key, new YMap());
            var attrs = entity.attributes;
            if (entity.hasOwnProperty("label")) {
              var ytext = map.set(entity.label.value.id, new YText());
              ytext.insert(0, entity.label.value.value);
            }
            initAttributes(attrs, map);
          }
        }
        for (var key in data.edges) {
          if (data.edges.hasOwnProperty(key)) {
            var entity = data.edges[key];
            var map = y.getMap("edges").set(key, new YMap());
            var attrs = entity.attributes;
            if (entity.hasOwnProperty("label")) {
              var ytext = map.set(entity.label.value.id, new YText());
              ytext.insert(0, entity.label.value.value);
            }
            initAttributes(attrs, map);
          }
        }
        y.getMap("canvas").set("ReloadWidgetOperation", "import");
      } else {
        $(loadStatus).text("Loading failed.");
        cleanStatus("loadStatus");
      }
    };
    xhr.send(null);
  }

  submitModel() {
    var sendStatus = $("#sendStatus");
    const spinner = $("#sendStatusSpinner");
    const btn = $("#submit-model");
    var endpoint = y.getText("sbfManager").toString();
    var model = y.getMap("data").get("model");
    sendStatus.text("Sending...");
    spinner.show();
    btn.prop("disabled", true);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status == 200) {
        sendStatus.text("Successfully sent.");
        alert("The bot has been successfully sent and is now available.");
      } else {
        if (xhr.response != undefined) {
          alert(
            "There is something wrong with your bot model: " + xhr.response
          );
        } else {
          alert(
            "The bot could not be sent. Please make sure that: the Social Bot Manager is running, your endpoint is correct, your bot model is correct."
          );
        }
      }
      spinner.hide();
      btn.prop("disabled", false);
      // cleanStatus("sendStatus");
    };

    xhr.open("POST", endpoint + "/bots");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(model));
  }

  deleteModel() {
    let messengers = [];
    let instanceName = "";
    let botName = "";

    var sendStatus = $("#sendStatus");
    const spinner = $("#deleteStatusSpinner");
    const btn = $("#delete-nlu-model");
    var endpoint = y.getText("sbfManager").toString();
    var model = y.getMap("data").get("model");
    sendStatus.text("Sending...");
    const instanceNode = Object.values(model["nodes"]).find(
      (node) => node.type === "Instance"
    );
    const botNode = Object.values(model["nodes"]).find(
      (node) => node.type === "Bot"
    );
    const messengerNodes = Object.values(model["nodes"]).filter(
      (node) => node.type === "Messenger"
    );

    instanceName = Object.values(instanceNode.attributes).find(
      (attr) => attr.name === "Name"
    )?.value?.value;

    botName = Object.values(botNode.attributes).find(
      (attr) => attr.name === "Name"
    )?.value?.value;

    messengers = messengerNodes.map((messengerNode) => {
      const name = Object.values(messengerNode.attributes).find(
        (attr) => attr.name === "Name"
      )?.value?.value;
      const authToken = Object.values(messengerNode.attributes).find(
        (attr) => attr.name === "Authentication Token"
      )?.value?.value;
      return { name, authToken };
    });

    spinner.show();
    btn.prop("disabled", true);

    var xhr = new XMLHttpRequest();
    var agentId = "";
    xhr.onload = function () {
      if (xhr.status == 200) {
        sendStatus.text("Successfully sent.");
        try {
          agentId = JSON.parse(xhr.response)[instanceName][botName]["id"];
          xhr2.open("DELETE", endpoint + "/bots/" + agentId);
          xhr2.setRequestHeader("Content-Type", "application/json");
          // delete the chosen bot
          xhr2.send(JSON.stringify({ messengers: messengers }));
        } catch (error) {
          if (JSON.parse(xhr.response)[instanceName] == undefined) {
            error = "Instance Name not found";
          } else if (
            JSON.parse(xhr.response)[instanceName][botName] == undefined
          ) {
            error = "Bot Name not found";
          }
          alert("The submitted model has following problems: " + error);
        }
      } else {
        alert(
          "The bot could not be deleted. The endpoint does not seem to be working."
        );
      }
      spinner.hide();
      btn.prop("disabled", false);
      // cleanStatus("sendStatus");
    };

    var xhr2 = new XMLHttpRequest();
    xhr2.onload = function () {
      if (xhr2.status == 200) {
        sendStatus.text("Successfully sent.");
        alert("The bot has been successfully deleted!");
      } else {
        alert(
          "The bot could not be deleted. Please check if the messengerName and authToken are right!"
        );
      }
      spinner.hide();
      btn.prop("disabled", false);
      // cleanStatus("sendStatus");
    };
    // first fetch the deployed bots
    xhr.open("GET", endpoint + "/bots");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  }

  storeModel() {
    var name = y.getText("storeName").toString();
    var endpoint = y.getText("sbfManager").toString();
    var model = y.getMap("data").get("model");
    var storeStatus = $("#storeStatus");
    const spinner = $("#storeStatusSpinner");
    const btn = $("#store-model");
    spinner.show();
    storeStatus.text("Storing...");
    btn.prop("disabled", true);

    if (name && model) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status == 200) {
          alert("Your bot model has been successfully backed up");
          updateMenu();
        } else {
          alert(
            "Your bot model could not be backed up. Make sure that the SBF endpoint is correct. "
          );
        }
        spinner.hide();
        btn.prop("disabled", false);
        //   cleanStatus("storeStatus");
      };
      xhr.open("POST", endpoint + "/models/" + name);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(model));
    } else {
      if (!name) {
        alert("The model name is invalid.");
      } else {
        alert("The model name is empty.");
      }
      spinner.hide();
      btn.prop("disabled", false);
      cleanStatus("storeStatus");
    }
  }

  firstUpdated() {
    super.firstUpdated();
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    instance.connect().then((y) => {
      if (!("y" in window)) window.y = y;
      this.guidance = getGuidanceModeling();

      this.sbfManagerEndpointEditor = new Quill(
        document.querySelector("#sbfManagerEndpointInput"),
        {
          modules: {
            toolbar: false, // toolbar options
            keyboard: keyboardEnterPrevent,
          },
          cursors: false,
          placeholder: "Enter your endpoint here...",
          theme: "snow", // or 'bubble'
        }
      );

      if (!this.sbfManagerEndpointEditor) {
        throw new Error("Could not find quill editor");
      }
      new QuillBinding(y.getText("sbfManager"), this.sbfManagerEndpointEditor);

      this.storeNameInputEditor = new Quill(
        document.querySelector("#storeNameInput"),
        {
          modules: { toolbar: false, keyboard: keyboardEnterPrevent },
          cursors: false,
          placeholder: "Enter a name for your model...",
          theme: "snow",
        }
      );
      if (!this.storeNameInputEditor) {
        throw new Error("Could not find quill editor");
      }
      new QuillBinding(y.getText("storeName"), this.storeNameInputEditor);

      this.updateMenu();

      // function showAlert(message, type) {
      //   var alert = document.createElement("div");
      //   alert.className = "mb-2 alert alert-" + type;
      //   const n = document.querySelectorAll(".alert").length;
      //   alert.id = "alert-" + n;
      //   alert.click = removeAlert(alert.id);
      //   alert.innerHTML = message;
      //   document.querySelector("#alerts").appendChild(alert);
      //   setTimeout(function () {
      //     alert.parentNode.removeChild(alert);
      //   }, 3000);
      // }

      // function removeAlert(id) {
      //   const alert = document.getElementById(id);
      //   for (var i = 0; i < alerts.length; i++) {
      //     alert.parentNode.removeChild(alert);
      //   }
      // }
    });
  }

  render() {
    return html`
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossorigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
      />
      <style>
        body {
          overflow-x: hidden;
        }
        .ql-container{
          flex-grow: 1;
        }
        #loadNameInput{
          height: 44px;
        }
        
      </style>

      <div class="m-1">
        <h3>Bot Operations</h3>
        <div class="row">
          <div id="modeluploader" class="col col-5">
            <label for="sbfManagerEndpointInput" class="form-label"
              >Social bot manager endpoint
            </label>
            <div class="input-group mb-3">
              <div id="sbfManagerEndpointInput"></div>
              <button
                id="submit-model"
                type="button"
                class="btn btn-outline-primary"
                @click="${this.submitModel}"
              >
                <i class="bi bi-robot"></i> Submit
                <div
                  class="spinner-border spinner-border-sm text-secondary"
                  id="sendStatusSpinner"
                  role="status"
                  style="display: none"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </button>
              <button
                id="delete-nlu-model"
                type="button"
                class="btn btn-outline-danger"
                @click="${this.deleteModel}"
              >
                <i class="bi bi-cloud-slash-fill"></i> Deactivate
                <div
                  class="spinner-border spinner-border-sm text-secondary"
                  id="deleteStatusSpinner"
                  role="status"
                  style="display: none"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </button>
            </div>
          </div>

     
            <div id="modelstorer" class="col col-4">
              <label for="store-model" class="form-label">Store model</label>
              <div class="input-group mb-3">
                <div id="storeNameInput"></div>

                <button id="store-model" class="btn btn-outline-primary">
                  <i class="bi bi-cloud-arrow-up"></i> Store
                  <div
                    class="spinner-border spinner-border-sm text-secondary"
                    id="storeStatusSpinner"
                    style="display: none"
                    role="status"
                    @click="${this.storeModel}"
                  >
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="col col-3">
              <div id="modelloader">
                <label for="loadNameInput" class="form-label">Load model</label>
                <div class="input-group">
                  <select
                    id="loadNameInput"
                    class="form-select form-control"
                  ></select>

                  <button
                    id="load-model"
                    class="btn btn-outline-primary"
                    @click="${this.loadModel}"
                  >
                    <i class="bi bi-cloud-arrow-down"></i> Load
                    <div
                      class="spinner-border spinner-border-sm text-secondary"
                      id="loadStatusSpinner"
                      role="status"
                      style="display: none"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function cleanStatus(field) {
  const status = document.querySelector("#" + field);
  $(status).text("");
}

window.customElements.define("bot-manager-widget", BotManagerWidget);
