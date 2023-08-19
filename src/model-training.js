import { LitElement, html, css } from "lit";
import NLUConfig from "./nlu.md.js";
import ModelOps from "./model-ops.js";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import config from "../config.json";

const production = "env:development" === "env:production";

/**
 * @customElement
 *
 */
class ModelTraining extends LitElement {
  static properties = {
    missingIntents: { type: Set, state: true },
    intentCoverage: { type: Number, state: true },
  };
  static styles = css`
    #editor {
      height: 512px;
    }
  `;
  render() {
    return html`
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
        />
        <!-- Bootstrap core CSS -->
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          crossorigin="anonymous"
        />

        <!-- Theme included stylesheets -->
        <link href="//cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet" />
      </head>
      <main role="main" class="container" style="margin-top: 76px">
        <div class="card border-0 shadow-sm card-body bg-light p-4">
          <h1>NLU Model Training Helper</h1>
          <p class="lead">
            With this tool, you can edit the training data for an NLU model and
            send it to a Rasa NLU server for training.
          </p>
          <form>
            <div class="form-group">
              <label for="formControlTextArea">Model Training Data</label>
              <div id="editor" class="form-control"></div>
            </div>
            <div class="d-flex justify-content-end my-2">
              <button
                type="button"
                class="btn btn-lg btn-danger "
                @click="${this.resetForm}"
              >
                <i class="bi bi-arrow-clockwise"></i> Reset
              </button>
            </div>
            <div class="mb-3 input-group">
              <label for="rasaEndpoint">Rasa NLU Endpoint</label>

              <div id="rasaEndpoint" class="w-100 form-control"></div>
              <!-- Kubernetes cluster IP of the sbf/rasa-nlu service -->
            </div>
            <div class="mb-3 input-group">
              <label for="sbfManagerEndpoint">SBF Manager Endpoint</label>
              <div id="sbfManagerEndpoint" class="w-100 form-control"></div>
            </div>
            <div class="row mb-3">
              <div class="col">
                <label for="dataName">Dataset Name</label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    class="form-control"
                    id="dataName"
                    placeholder=""
                    value=""
                  />
                  <button
                    type="button"
                    class="btn btn-lg btn-outline-primary"
                    @click="${this.storeData}"
                  >
                    <i class="bi bi-cloud-arrow-up"></i> Store
                  </button>
                </div>
              </div>
              <div class="col">
                <label for="loadNameInput">Load Dataset</label>
                <div class="input-group">
                  <select
                    id="loadNameInput"
                    form-select
                    class="browser-default custom-select form-select"
                  ></select>
                  <button
                    type="button"
                    class="btn btn-lg btn-outline-primary"
                    @click="${this.loadData}"
                  >
                    <i class="bi bi-cloud-arrow-down"></i> Load
                  </button>
                </div>
              </div>
            </div>
            <div
              class="d-flex flex-row mb-3 justify-content-end align-items-center"
            >
              <button
                type="button"
                class="btn btn-lg btn-info"
                @click="${this.showIntentCoverage}"
              >
                Intent Coverage
              </button>
              <i id="trainingStatus" class="form-text text-muted me-1"></i>
              <button
                type="button"
                class="btn btn-lg btn-secondary me-2"
                @click="${this.retrieveStatus}"
              >
                <i class="bi bi-cpu"></i> Training Status
              </button>
              <button
                type="button"
                class="btn btn-lg btn-primary"
                @click="${this.submitForm}"
              >
                <i class="bi bi-upload"></i> Submit
              </button>
            </div>
          </form>
        </div>
        <!-- Vertically centered modal -->

        <div class="modal fade" id="intentCoverageModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Intent Coverage: ${Math.round(
                  this.intentCoverage
                )}%
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div id="intentCoverageModalBody" class="modal-body">
                ${
                  this.intentCoverage === 100
                    ? html`<h5>
                        All intents are covered by your training data. Great
                        job!
                      </h5>`
                    : html`
                        <h5>Missing Intents:</h5>

                        <ul class="list-group list-group-flush">
                          <!-- loop over missing intents -->
                          ${this.missingIntents.map((intent) => {
                            return html` <li class="list-group-item">
                              ${intent}
                            </li>`;
                          })}
                        </ul>
                      `
                }
              
            </div>
          </div>
        </div>
      </main>
    `;
  }

  constructor() {
    super();
    this.missingIntents = [];
    this.intentCoverage = 0;
  }

  async firstUpdated() {
    this.dataName = this.htmlQuery("#dataName");
    this.loadName = this.htmlQuery("#loadNameInput");
    this.curModels = [];
    this.modal = new bootstrap.Modal(
      this.shadowRoot.getElementById("intentCoverageModal")
    );

    const y = await ModelOps.getY(true);

    if (this.shadowRoot.getElementById("editor") == null)
      throw new Error("Editor not found");
    // NLU training data editor
    this.editor = new Quill(this.shadowRoot.getElementById("editor"), {
      modules: {
        toolbar: [[{ header: [1, 2, false] }], ["bold", "italic", "underline"]],
      },
      formats: ["bold", "color", "font", "italic", "underline"],
      placeholder: "Write your training data here...",
      theme: "snow",
    });
    new QuillBinding(y.getText("training"), this.editor);

    // SBF Manager endpoint
    const _sbfQuill = new Quill(
      this.shadowRoot.getElementById("sbfManagerEndpoint"),
      {
        modules: {
          toolbar: false,
        },
        placeholder: "",
        theme: "snow",
      }
    );

    new QuillBinding(y.getText("sbfManager"), _sbfQuill);

    // Rasa NLU endpoint
    const _rasaQuill = new Quill(
      this.shadowRoot.getElementById("rasaEndpoint"),
      {
        modules: {
          toolbar: false,
        },
        placeholder: "",
        theme: "snow",
      }
    );

    new QuillBinding(y.getText("rasa"), _rasaQuill);
    // setTimeout(() => {
    //   y.transact(() => {
    //     if (y.getText("rasa")?.toString().length === 0) {
    //       y.getText("rasa").delete(0, y.getText("rasa").length);
    //       y.getText("rasa").insert(
    //         0,
    //         config.rasaEndpoint ? config.rasaEndpoint : "http://localhost:5005"
    //       );
    //     }

    //     if (y.getText("sbfManager")?.toString().length === 0) {
    //       y.getText("sbfManager").delete(0, y.getText("sbfManager").length);
    //       y.getText("sbfManager").insert(
    //         0,
    //         config.sbfManagerHost
    //           ? config.sbfManagerHost
    //           : "http://localhost:8080"
    //       );
    //     }
    //   });
    // }, 1000);

    this.updateMenu();
  }

  htmlQuery(query) {
    return this.shadowRoot.querySelector(query);
  }

  resetForm() {
    if (confirm("Reset textarea to example config?")) {
      this.editor.setText(NLUConfig);
    }
  }

  async submitForm() {
    var _this = this;
    const y = await ModelOps.getY(true);
    await this.determineIntentCoverage();
    if (
      this.intentCoverage < 100 &&
      !confirm(
        "Your training data is missing some intents. Do you still wish to submit it? You can check the missing intents by clicking the Intent Coverage button."
      )
    ) {
      return;
    }
    const trainingUrl = y.getText("sbfManager").toString() + "/trainAndLoad/";
    const rasaUrl = y.getText("rasa").toString();
    $(_this.htmlQuery("#trainingStatus")).text(
      `Submitting NLU Modelt to ${trainingUrl} and starting training...`
    );
    $.ajax({
      type: "POST",
      url: trainingUrl,
      data: JSON.stringify({
        url: rasaUrl,
        config:
          'language: "de"\npipeline:\n - name: WhitespaceTokenizer\n - name: RegexFeaturizer\n - name: CRFEntityExtractor\n - name: EntitySynonymMapper\n - name: CountVectorsFeaturizer\n - name: DIETClassifier\npolicies:\n - name: MemoizationPolicy\n - name: KerasPolicy\n - name: MappingPolicy\n - name: FormPolicy\n',
        markdownTrainingData: _this.editor.getText(),
      }),
      contentType: "application/json",
      success: function (data, textStatus, jqXHR) {
        $(_this.htmlQuery("#trainingStatus")).text(data);
      },
      error: function (xhr, textStatus, errorThrown) {
        $(_this.htmlQuery("#trainingStatus")).text(
          textStatus + " - " + errorThrown
        );
      },
    });
  }

  async extractIntentsFromBotModel() {
    const y = await ModelOps.getY(true);
    const model = y.getMap("data").get("model");
    if (!model) {
      return new Set();
    }
    const incomingMessageNodes = Object.values(model["nodes"]).filter(
      (node) => node.type === "Incoming Message"
    );
    const leadsToEdges = Object.values(model["edges"]).filter(
      (edge) => edge.type === "leadsTo"
    );
    const intents = new Set();

    for (const node of incomingMessageNodes) {
      for (const attribute of Object.values(node.attributes)) {
        if (
          attribute.name === "Intent Keyword" &&
          attribute.value.value !== ""
        ) {
          let intentValue = attribute.value.value;
          if (intentValue.includes(",")) {
            for (const int of intentValue.split(",")) {
              intents.add(int.trim());
            }
          } else {
            intents.add(intentValue);
          }
        }
      }
    }

    for (const edge of leadsToEdges) {
      if (edge.label.value.value !== "") {
        let intentValue = edge.label.value.value;
        if (intentValue.includes(",")) {
          for (const int of intentValue.split(",")) {
            intents.add(int.trim());
          }
        } else {
          intents.add(intentValue);
        }
      }
    }

    return intents;
  }

  async extractIntentsFromNLUModel() {
    const intents = new Set();
    for (const line of this.editor.getText().split("\n")) {
      if (line.trimStart().includes("intent:")) {
        let intentValue = line.trimStart().split("intent:")[1].trim();
        intents.add(intentValue);
      }
    }
    return intents;
  }

  async determineIntentCoverage() {
    const botModelIntents = await this.extractIntentsFromBotModel();
    const nluModelIntents = await this.extractIntentsFromNLUModel();
    // check if all intents from bot model are covered by nlu model
    const missingIntents = new Set();
    for (const intent of botModelIntents) {
      if (!nluModelIntents.has(intent) && intent !== "default") {
        missingIntents.add(intent);
      }
    }

    this.missingIntents = Array.from(missingIntents).sort();
    const coverage = (1 - missingIntents.size / botModelIntents.size) * 100;
    this.intentCoverage = coverage;
  }

  async showIntentCoverage() {
    await this.determineIntentCoverage();
    // open modal
    this.modal.show();
  }

  async retrieveStatus() {
    const y = await ModelOps.getY(true);
    const trainingStatusUrl =
      y.getText("sbfManager").toString() + "/trainAndLoadStatus/";
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text(
      `Checking status from ${trainingStatusUrl},...`
    );
    $.ajax({
      type: "GET",
      url: trainingStatusUrl,
      contentType: "text/plain",
      success: function (data, textStatus, jqXHR) {
        $(_this.htmlQuery("#trainingStatus")).text(data);
      },
      error: function (xhr, textStatus, errorThrown) {
        $(_this.htmlQuery("#trainingStatus")).text(
          textStatus + " - " + errorThrown
        );
      },
    });
  }

  async storeData() {
    const y = await ModelOps.getY(true);
    const trainingStatusUrl = y.getText("sbfManager").toString() + "/training/";
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Storing...");
    var name = $(_this.htmlQuery("#dataName")).val();
    var trainingData = _this.editor.getText();

    $.ajax({
      type: "POST",
      url: trainingStatusUrl + name,
      data: trainingData,
      contentType: "text/plain",
      success: function (data, textStatus, jqXHR) {
        $(_this.htmlQuery("#trainingStatus")).text("Data stored.");
        _this.updateMenu(_this);
      },
      error: function (xhr, textStatus, errorThrown) {
        $(_this.htmlQuery("#trainingStatus")).text(
          textStatus + " - " + errorThrown
        );
      },
    });
  }

  async loadData() {
    const y = await ModelOps.getY(true);
    const trainingStatusUrl = y.getText("sbfManager").toString() + "/training/";
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Loading...");
    var name = $(_this.htmlQuery("#loadNameInput")).val();

    $.ajax({
      type: "GET",
      url: trainingStatusUrl + name,
      contentType: "text/plain",
      success: function (data, textStatus, jqXHR) {
        $(_this.htmlQuery("#trainingStatus")).text("Data loaded.");
        _this.editor.setText(data);
      },
      error: function (xhr, textStatus, errorThrown) {
        $(_this.htmlQuery("#trainingStatus")).text(
          textStatus + " - " + errorThrown
        );
      },
    });
  }

  async updateMenu() {
    const y = await ModelOps.getY(true);
    const _this = this;
    const trainingStatusUrl = y.getText("sbfManager").toString() + "/training/";
    $.ajax({
      type: "GET",
      url: trainingStatusUrl + "/training/",
      contentType: "application/json",
      success: function (data, textStatus, jqXHR) {
        if (textStatus !== "success") {
          return;
        }
        $.each(data, function (index, name) {
          if (!_this.curModels.includes(name)) {
            var template = document.createElement("template");
            template.innerHTML = "<option>" + name + "</option>";
            _this.loadName.append(template.content.firstChild);
            _this.curModels.push(name);
          }
        });
      },
    });
  }
}

window.customElements.define("model-training", ModelTraining);
