import { LitElement, html, css } from "lit";
import config from "../../config.json";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { Common } from "../common.js";
import { chartTypes } from "./chartTypes";

class MeasureVisualization extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
  `;

  static properties = {
    measure: { type: Object, state: true },
    loading: { type: Boolean, state: true },
  };

  set measure(measure) {
    const oldVal = this._measure;
    this._measure = measure;
    this.requestUpdate("measure", oldVal);

    if (measure == null) {
      if (this.visualizationContainer)
        this.visualizationContainer.innerHTML = "";
      this.loading = true;
      return;
    }
    if (this.measure.visualization.type === "Chart") {
      this.fetchVisualization("chart", this.measure.visualization.chartType);
    } else {
      this.fetchVisualization("json");
    }
  }

  loadingIndicator = html``;

  get measure() {
    return this._measure;
  }

  render() {
    return html`
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
      />
      <div>
        <h3>${this.measure?.name}</h3>
        <p id="visualization-container"></p>
        <div
          class="spinner-border"
          role="status"
          style="top:50%;left:50%;"
          ?hidden="${this.loading === false}"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  async firstUpdated() {
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    this.ydoc = await instance.connect();
    setTimeout(() => {
      this.configMap = this.ydoc.getMap("pm4bots-config");
      this.visualizationContainer = this.shadowRoot.querySelector(
        "#visualization-container"
      );
    }, 200);
  }

  async fetchVisualization(format = "chart", chartType = null) {
    let qvsEndpoint = this.configMap.get("query-viz-endpoint");

    if (!qvsEndpoint) {
      return;
    }

    qvsEndpoint = joinAbsoluteUrlPath(qvsEndpoint, "query", "visualize");
    if (chartType) {
      qvsEndpoint += "?format=" + chartTypes[chartType].STRING;
    } else {
      qvsEndpoint += "?format=JSON";
    }

    const botName = this.configMap.get("bot-name");
    const body = {
      cache: true,
      dbkey: "las2peermon",
      height: "50vh",
      width: "80vw",
      modtypei: null,
      query: this.measure.query,
      title: "",
    };
    const response = await fetch(qvsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: toAuthorizationHeader(botName),
      },
      body: JSON.stringify(body),
    });
    this.loading = false;
    if (format == "json") {
      const result = await response.json();

      if (this.measure.visualization.unit)
        this.visualizationContainer.innerHTML =
          result[2][0] + this.measure.visualization.unit;
      else this.visualizationContainer.innerHTML = result[2][0];
    } else {
      const result = await response.text();
      // embed into iframe

      const iframe = document.createElement("iframe");
      iframe.srcdoc = result;
      
      this.visualizationContainer.innerHTML = "";
      this.visualizationContainer.appendChild(iframe);
      this.visualizationContainer.style.height = "100%";
      this.visualizationContainer.style.width = "100%";
    }
  }
}

customElements.define("measure-visualization", MeasureVisualization);

function toAuthorizationHeader(username, password = "actingAgent") {
  return "Basic " + btoa(username + ":" + password);
}

function joinAbsoluteUrlPath(...args) {
  return args
    .filter((pathPart) => !!pathPart)
    .map((pathPart) => {
      if (typeof pathPart === "number") {
        pathPart = pathPart?.toString();
      }
      return pathPart
        .toString()
        ?.replace(/(^\/|\/$)/g, "")
        .trim();
    })
    .join("/");
}
