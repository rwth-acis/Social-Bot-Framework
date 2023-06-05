import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { html, css, LitElement } from "lit-element";
import config from "../config.json";
import { Common } from "./common.js";
import { Map as YMap } from "yjs";
import { QuillBinding } from "y-quill";
import Quill from "quill";

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

class ModelStorageForm extends LitElement {
  static styles = css`
    /* Add Bootstrap classes to style the form */
    .form-group {
      margin-bottom: 1rem;
    }
  `;

  constructor() {
    super();
    this.modelName = "";
    this.versionTag = "";
  }
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    const instance = getInstance({
      spaceTitle: Common.getYjsRoom(),
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
    });
    const y = await instance.connect();

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

    this.storeVersionInputEditor = new Quill(
      document.querySelector("#storeVersionInput"),
      {
        modules: { toolbar: false, keyboard: keyboardEnterPrevent },
        cursors: false,
        placeholder: "Enter the version tag of your model...",
        theme: "snow",
      }
    );
    if (!this.storeVersionInputEditor) {
      throw new Error("Could not find quill editor");
    }
    new QuillBinding(y.getText("storeVersion"), this.storeVersionInputEditor);
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
      <div class="modal-header">
        <h1 class="modal-title fs-5">Store Bot Model</h1>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <!-- Modal -->
      <div class="modal-body">
        <form>
          <div class="form-group">
            <label for="modelName">Model Name</label>
            <div id="storeNameInput"></div>
          </div>

          <div class="form-group">
            <label for="versionTag">Version (optional)</label>
            <div id="storeVersionInput"></div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary close-btn"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          @click="${this.storeModel}"
        >
          Store Model
        </button>
      </div>
    `;
  }

  async storeModel() {
    const instance = getInstance({
      spaceTitle: Common.getYjsRoom(),
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
    });
    const y = await instance.connect();
    const modelName = y.getText("storeName").toString();
    if (!modelName) {
      alert("Please enter a model name");
      return;
    }
    const currentBotModel = y.getMap("data").get("model");
    const modelData = {
      name: modelName,
      timestamp: new Date().toLocaleString(),
      username: this.username,
      versionTag: y.getText("storeVersion").toString() || "latest",
      model: currentBotModel,
    };
    let botModel = y.getMap("bot-models").get(modelName);
    if (!botModel) {
      botModel = new YMap();
      y.getMap("bot-models").set(modelName, botModel);
    }
    botModel.set(y.getText("storeVersion").toString(), modelData);
    alert("Model stored successfully");
    // close the modal
    const closeBtn = document
      .querySelector(".modal-footer")
      .querySelector("button.close-btn");
    closeBtn.click();
  }
}
customElements.define("model-storage-form", ModelStorageForm);