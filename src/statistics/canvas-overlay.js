import { LitElement, html } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";

/**
 * @customElement
 *
 */
class CanvasStatsOverlay extends LitElement {
  static properties = {
    loading: { type: Boolean, value: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    return html`<div id="model-statistics-overlay" style="display:none; position:absolute; top:0; left:0;right:0;bottom:0; background-color: #e9ecef; padding: 10px; border-radius: 5px;"
    "></div>`;
  }
  async firstUpdated() {
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    const y = await instance.connect();
    this.y = y;
    super.firstUpdated();
    this.configMap = y.getMap("pm4bots-config");

    setTimeout(() => {
      const botManagerEndpointInput = this.configMap
        .get("sbm-endpoint")
        .toString();
      const botModel = y.getMap("data").get("model");
      if (botModel) {
        const botElement = Object.values(botModel.nodes).find((node) => {
          return node.type === "Bot";
        });
        if (botElement) {
          const botName = botElement.label.value.value;
          this.fetchStatistics(botName, botManagerEndpointInput);
        }
      }
    }, 300);
  }

  async fetchStatistics(botName, botManagerEndpoint) {
    // botManagerEndpoint = "http://social-bot-manager:8080/SBFManager"
    const url = `${config.pm4botsEndpoint}/bot/${botName}/enhanced-model?bot-manager-url=${botManagerEndpoint}`;
    console.log(url);
    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      console.log(response);
      if (!response.ok) {
        this.loading = false;
        return;
      }

      const statistics = await response.json();
      console.log(statistics);
      this.loading = false;
      this.statistics = statistics;
      this.addMissingNodesAndEdges(statistics);
    } catch (error) {
      console.error(error);
    }
  }

  addMissingNodesAndEdges(statistics) {
    // Add missing edges to bot model as overlay
    const botModel = this.y.getMap("data").get("model");
    const botModelEdges = botModel.edges;
    const botModelNodes = botModel.nodes;
    for (const nodeId of statistics.graph.nodes) {
      if (!botModelNodes[nodeId]) {
        console.log("newNode", nodeId);
        botModelNodes[nodeId] = node;
      }
    }
  }
}

window.customElements.define("canvas-statistics-overlay", CanvasStatsOverlay);
