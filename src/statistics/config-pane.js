import { LitElement, html } from "lit-element";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { Common } from "../common.js";
import config from "../../config.json";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import { Text as YText } from "yjs";

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

class Pm4BotsConfig extends LitElement {
  static get properties() {
    return {
      message: { type: String },
    };
  }

  configOptions = [
    {
      id: "pm4bots-endpoint",
      label: "Pm4Bots Endpoint",
      placeholder:
        "https://bots-ma-lakhoune.tech4comp.dbis.rwth-aachen.de/pm4bots",
    },
    {
      id: "sbm-endpoint",
      label: "Social Bot Manager Endpoint",
      placeholder: "https://mobsos.tech4comp.dbis.rwth-aachen.de/SBFManager",
    },
    {
      id: "event-log-endpoint",
      label: "Event Log Endpoint",
      placeholder: "https://mobsos.tech4comp.dbis.rwth-aachen.de/event-log",
    },
    {
      id: "success-modeling-endpoint",
      label: "Success Modeling Endpoint",
      placeholder:
        "https://mobsos.tech4comp.dbis.rwth-aachen.de/mobsos-success-modeling/apiv2",
    },
    {
      id: "query-viz-endpoint",
      label: "Query Visualization Endpoint",
      placeholder: "https://mobsos.tech4comp.dbis.rwth-aachen.de/QVS",
    },
    {
      id: "service-name",
      label: "Service name",
      placeholder: "i5.las2peer.services.mensaService.MensaService",
    },
    {
      id: "group-id",
      label: "Group Id",
      placeholder:
        "343da947a6db1296fadb5eca3987bf71f2e36a6d088e224a006f4e20e6e7935bb0d5ce0c13ada9966228f86ea7cc2cf3a1435827a48329f46b0e3963213123e0",
    },
  ];

  constructor() {
    super();
  }

  render() {
    return html`
      <link
        href="https://cdn.quilljs.com/1.3.6/quill.snow.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
      />

      <div>
        <button
          type="button"
          class="btn btn-secondary mb-3"
          @click="${this.insertDefaults}"
        >
          Insert Default Values
        </button>
        ${this.configOptions.map(
          (item) => html`
            <div class="mb-3">
              <label for="${item.id}">${item.label}</label>
              <div id="${item.id}" class="rounded"></div>
            </div>
          `
        )}
      </div>
    `;
  }
  async firstUpdated() {
    super.firstUpdated();
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    const doc = await instance.connect();
    await new Promise((resolve) => setTimeout(resolve, 400));

    this.initConfigMap(doc.getMap("pm4bots-config"));
  }

  initConfigMap(configMap) {
    this.configMap = configMap;

    for (const value of this.configOptions) {
      const key = value.id;

      const editor = new Quill(this.shadowRoot.getElementById(key), {
        modules: {
          toolbar: false,
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: value.placeholder,
        theme: "snow",
      });
      if (!this.configMap.has(key)) {
        this.configMap.set(key, new YText());
      }
      new QuillBinding(this.configMap.get(key), editor);
    }
  }

  insertDefaults() {
    for (const value of this.configOptions) {
      const key = value.id;
      const placeholder = value.placeholder;
      this.configMap.get(key).insert(0, placeholder);
    }
  }
}

customElements.define("pm4bots-config", Pm4BotsConfig);
