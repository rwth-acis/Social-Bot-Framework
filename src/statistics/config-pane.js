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
      placeholder: "https://pm4bots-endpoint",
    },
    {
      id: "sbm-endpoint",
      label: "Social Bot Manager Endpoint",
      placeholder: "https://sbm-endpoint",
    },
    {
      id: "event-log-endpoint",
      label: "Event Log Endpoint",
      placeholder: "https://event-log-endpoint",
    },
    {
      id: "success-modeling-endpoint",
      label: "Success Modeling Endpoint",
      placeholder: "https://success-modeling-endpoint",
    },
    {
      id: "query-viz-endpoint",
      label: "Query Visualization Endpoint",
      placeholder: "https://query-viz-endpoint",
    },
    { id: "service-name", label: "Service name", placeholder: "My Service" },
    { id: "group-id", label: "Group Id", placeholder: "123456" },
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
}

customElements.define("pm4bots-config", Pm4BotsConfig);
