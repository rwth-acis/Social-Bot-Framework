import { LitElement, html, css } from "lit";
import NLUConfig from "./nlu.md.js";
import ModelOps from "./model-ops.js";
import { QuillBinding } from "y-quill";
import "https://cdn.quilljs.com/1.3.7/quill.js";

const production = "env:development" === "env:production";

/**
 * @customElement
 *
 */
class ModelTraining extends LitElement {
  static properties = {};
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
      </main>
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    this.dataName = this.htmlQuery("#dataName");
    this.loadName = this.htmlQuery("#loadNameInput");
    this.curModels = [];

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

    if (y.getText("rasa")?.toString().length === 0) {
      y.getText("rasa").insert(
        0,
        production ? "{RASA_URL}" : "http://localhost:5005"
      );
    }

    if (y.getText("sbfManager")?.toString().length === 0) {
      y.getText("sbfManager").insert(
        0,
        production ? "{SBF_MANAGER}" : "http://localhost:8080"
      );
    }

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

  submitForm() {
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Starting training...");
    $.ajax({
      type: "POST",
      url: $(_this.htmlQuery("#sbfManagerEndpoint")).val() + "/trainAndLoad/",
      data: JSON.stringify({
        url: $(_this.htmlQuery("#rasaEndpoint")).val(),
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

  retrieveStatus() {
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Checking status...");
    $.ajax({
      type: "GET",
      url:
        $(_this.htmlQuery("#sbfManagerEndpoint")).val() +
        "/trainAndLoadStatus/",
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

  storeData() {
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Storing...");
    var name = $(_this.htmlQuery("#dataName")).val();
    var trainingData = _this.editor.getText();

    $.ajax({
      type: "POST",
      url:
        $(_this.htmlQuery("#sbfManagerEndpoint")).val() + "/training/" + name,
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

  loadData() {
    var _this = this;
    $(_this.htmlQuery("#trainingStatus")).text("Loading...");
    var name = $(_this.htmlQuery("#loadNameInput")).val();

    $.ajax({
      type: "GET",
      url:
        $(_this.htmlQuery("#sbfManagerEndpoint")).val() + "/training/" + name,
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

  updateMenu() {
    const _this = this;
    const botManagerEndpoint = $(_this.htmlQuery("#sbfManagerEndpoint")).text();
    $.ajax({
      type: "GET",
      url: botManagerEndpoint + "/training/",
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
