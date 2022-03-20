requirejs(
  ["jqueryui", "lodash", "lib/yjs-sync", "promise!Guidancemodel"],
  function ($, _, yjsSync, guidance) {
    $(function () {
      yjsSync().done(function (y, spaceTitle) {
        console.info(
          "DEBUG: Yjs successfully initialized in room " +
            spaceTitle +
            " with y-user-id: " +
            y.db.userId
        );

        var $submitModel = $("#submit-model"),
          $deleteModel = $("#delete-model"),
          $storeModel = $("#store-model"),
          $loadModel = $("#load-model"),
          $loadNameInput = $("#loadNameInput");

        var sbfManagerEndpointInput = document.querySelector(
          "#sbfManagerEndpointInput"
        );
        if (!y.share.sbfManager.toString()) {
          y.share.sbfManager.insert(0, "{SBF_MANAGER}");
        }
        y.share.sbfManager.bindTextarea(sbfManagerEndpointInput);

        storeNameInput = document.querySelector("#storeNameInput");
        y.share.storeName.bindTextarea(storeNameInput);
        var curModels = [];
        updateMenu();
        setInterval(updateMenu, 10000);

        $submitModel.click(function () {
          var sendStatus = $("#sendStatus");
          const spinner = $("#sendStatusSpinner");
          const btn = $("#submit-model")
          var endpoint = y.share.sbfManager.toString();
          var model = y.share.data.get("model");
          sendStatus.text("Sending...");
          spinner.show();
          btn.prop("disabled", true)

          var xhr = new XMLHttpRequest();
          xhr.onload = function () {
            if (xhr.status == 200) {
              sendStatus.text("Successfully sent.");
              alert("The bot has been successfully sent and is now available.");
            } else {
              alert(
                "The bot could not be sent. Please check the Social bot manager endpoint and try again."
              );
            }
            spinner.hide();
            btn.prop("disabled", false);
            // cleanStatus("sendStatus");
          };

          xhr.open("POST", endpoint + "/bots");
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(model));
        });

        $deleteModel.click(function () {
          let messengerNames = [];
          let instanceName = "";
          let botName = "";

          var sendStatus = $("#sendStatus");
          const spinner = $("#deleteStatusSpinner");
          const btn = $("#delete-model");
          var endpoint = y.share.sbfManager.toString();
          var model = y.share.data.get("model");
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

          messengerNames = messengerNodes.map((messengerNode) => {
            const name = Object.values(messengerNode.attributes).find(
              (attr) => attr.name === "Name"
            )?.value?.value;
            const authToken = Object.values(messengerNode.attributes).find(
              (attr) => attr.name === "Authentication Token"
            )?.value?.value;
            return { name, authToken };
          });

          spinner.show();
          btn.prop("disabled", true)

          var xhr = new XMLHttpRequest();
          var agentId = ""
          xhr.onload = function () {
           if (xhr.status == 200) {

              sendStatus.text("Successfully sent.");
              try{
              agentId = JSON.parse(xhr.response)[instanceName][botName]["id"]
              xhr2.open("DELETE", endpoint + "/bots/" + agentId);
              xhr2.setRequestHeader("Content-Type", "application/json");
              // delete the chosen bot
              xhr2.send(JSON.stringify({"messengerNames":messengerNames}));
              } catch(error){
                if(JSON.parse(xhr.response)[instanceName] == undefined){
                  error = "Instance Name not found"
                } else if(JSON.parse(xhr.response)[instanceName][botName] == undefined){
                  error = "Bot Name not found"
                }
                alert("Given bot parameter is wrong: " + error);
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
        });

        $storeModel.click(function () {
          var name = y.share.storeName.toString();
          var endpoint = y.share.sbfManager.toString();
          var model = y.share.data.get("model");
          var storeStatus = $("#storeStatus");
          const spinner = $("#storeStatusSpinner");
          const btn = $("#store-model")
          spinner.show();
          storeStatus.text("Storing...");
          btn.prop("disabled", true)

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
        });

        

        $loadModel.click(function () {
          var name = $loadNameInput.val();
          var endpoint = y.share.sbfManager.toString();
          var loadStatus = $("#loadStatus");
          const spinner = $("#loadStatusSpinner");
          const btn = $("#load-model")
          $(loadStatus).text("Loading...");
          spinner.show();
          btn.prop("disabled", true)

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
                        var ytext = map.set(attr[key].key.id, Y.Text);
                        ytext.insert(0, attr[key].key.value);
                      } else {
                        var ytext = map.set(attr[key].value.id, Y.Text);
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
                          var ytext = map.set(value.id, Y.Text);
                          ytext.insert(0, value.value);
                        }
                      }
                    }
                  }
                }
              };
              if (guidance.isGuidanceEditor())
                y.share.data.set("guidancemodel", data);
              else y.share.data.set("model", data);
              for (var key in data.nodes) {
                if (data.nodes.hasOwnProperty(key)) {
                  var entity = data.nodes[key];
                  var map = y.share.nodes.set(key, Y.Map);
                  var attrs = entity.attributes;
                  if (entity.hasOwnProperty("label")) {
                    var ytext = map.set(entity.label.value.id, Y.Text);
                    ytext.insert(0, entity.label.value.value);
                  }
                  initAttributes(attrs, map);
                }
              }
              for (var key in data.edges) {
                if (data.edges.hasOwnProperty(key)) {
                  var entity = data.edges[key];
                  var map = y.share.edges.set(key, Y.Map);
                  var attrs = entity.attributes;
                  if (entity.hasOwnProperty("label")) {
                    var ytext = map.set(entity.label.value.id, Y.Text);
                    ytext.insert(0, entity.label.value.value);
                  }
                  initAttributes(attrs, map);
                }
              }
              y.share.canvas.set("ReloadWidgetOperation", "import");
            } else {
              $(loadStatus).text("Loading failed.");
              cleanStatus("loadStatus");
            }
          };
          xhr.send(null);
        });

        function cleanStatus(field) {
          const status = document.querySelector("#" + field);
          $(status).text("");
        }

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

        function updateMenu() {
          var xhr = new XMLHttpRequest();
          var endpoint = y.share.sbfManager.toString();
          xhr.open("GET", endpoint + "/models/");
          xhr.onload = function () {
            if (xhr.status == 200) {
              var models;
              try {
                models = JSON.parse(xhr.response);
              } catch (e) {
                console.error("error while parsing models", e);
                return;
              }
              $.each(models, function (index, model) {
                if (!curModels.includes(model)) {
                  $loadNameInput.append("<option>" + model + "</option>");
                  curModels.push(model);
                }
              });
            }
          };
          xhr.send(null);
        }
      });
    });
  }
);
