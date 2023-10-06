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
        <div class="mb-3">
          <label for="pm4bots-endpoint">Pm4Bots Endpoint</label>
          <div id="pm4bots-endpoint" class="rounded"></div>
        </div>
        <div class="mb-3">
          <div class="mb-3">
            <label for="event-log-endpoint">Event Log Endpoint</label>
            <div id="event-log-endpoint" class="rounded"></div>
          </div>
          <div class="mb-3">
            <label for="success-modeling-endpoint"
              >Success Modeling Endpoint</label
            >
            <div id="success-modeling-endpoint" class="rounded"></div>
          </div>
          <div class="mb-3">
            <label for="query-viz-endpoint">Query Visualization Endpoint</label>
            <div id="query-viz-endpoint" class="rounded"></div>
          </div>
          <div class="mb-3">
            <label for="service-name">Service name</label>
            <div id="service-name" class="rounded"></div>
          </div>
          <div class="mb-3">
            <label for="group-id">Group Id</label>
            <div id="group-id" class="rounded"></div>
          </div>
        </div>
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.initConfigMap(doc.getMap("pm4bots-config"));
  }

  initConfigMap(configMap) {
    this.configMap = configMap;

    this.eventLogEndpoint = new Quill(
      this.shadowRoot.getElementById("event-log-endpoint"),
      {
        modules: {
          toolbar: false, // toolbar options
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: "https://event-log-endpoint",
        theme: "snow", // or 'bubble'
      }
    );
    this.pm4botsEndpoint = new Quill(
      this.shadowRoot.getElementById("pm4bots-endpoint"),
      {
        modules: {
          toolbar: false, // toolbar options
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: "https://pm4bots-endpoint",
        theme: "snow", // or 'bubble'
      }
    );

    this.successModelingEndpoint = new Quill(
      this.shadowRoot.getElementById("success-modeling-endpoint"),
      {
        modules: {
          toolbar: false, // toolbar options
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: "https://success-modeling-endpoint",
        theme: "snow", // or 'bubble'
      }
    );

    this.queryVizEndpoint = new Quill(
      this.shadowRoot.getElementById("query-viz-endpoint"),
      {
        modules: {
          toolbar: false, // toolbar options
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: "https://query-viz-endpoint",
        theme: "snow", // or 'bubble'
      }
    );
    this.serviceName = new Quill(
      this.shadowRoot.getElementById("service-name"),
      {
        modules: {
          toolbar: false, // toolbar options
          keyboard: keyboardEnterPrevent,
        },
        cursors: false,
        placeholder: "i5.las2peer.services.mensaService.MensaService",
        theme: "snow", // or 'bubble'
      }
    );
    this.groupId = new Quill(this.shadowRoot.getElementById("group-id"), {
      modules: {
        toolbar: false, // toolbar options
        keyboard: keyboardEnterPrevent,
      },
      cursors: false,
      placeholder:
        "343da947a6db1296fadb5eca3... (you can find it using the contact service)",
      theme: "snow", // or 'bubble'
    });
    if (!this.configMap.has("pm4bots-endpoint")) {
      this.configMap.set("pm4bots-endpoint", new YText());
    }
    if (!this.configMap.has("event-log-endpoint")) {
      this.configMap.set("event-log-endpoint", new YText());
    }
    if (!this.configMap.has("success-modeling-endpoint")) {
      this.configMap.set("success-modeling-endpoint", new YText());
    }
    if (!this.configMap.has("query-viz-endpoint")) {
      this.configMap.set("query-viz-endpoint", new YText());
    }
    if (!this.configMap.has("service-name")) {
      this.configMap.set("service-name", new YText());
    }
    if (!this.configMap.has("group-id")) {
      this.configMap.set("group-id", new YText());
    }
    new QuillBinding(
      this.configMap.get("pm4bots-endpoint"),
      this.pm4botsEndpoint
    );
    new QuillBinding(
      this.configMap.get("event-log-endpoint"),
      this.eventLogEndpoint
    );
    new QuillBinding(
      this.configMap.get("success-modeling-endpoint"),
      this.successModelingEndpoint
    );
    new QuillBinding(
      this.configMap.get("query-viz-endpoint"),
      this.queryVizEndpoint
    );
    new QuillBinding(this.configMap.get("service-name"), this.serviceName);
    new QuillBinding(this.configMap.get("group-id"), this.groupId);
  }
}

customElements.define("pm4bots-config", Pm4BotsConfig);
