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
    super.firstUpdated();
    const botManagerEndpoint = y.getText("sbfManager").toString();

    setTimeout(() => {
      const botModel = y.getMap("data").get("model");
      if (botModel) {
        const botElement = Object.values(botModel.nodes).find((node) => {
          return node.type === "Bot";
        });
        if (botElement) {
          const botName = botElement.label.value.value;
          this.fetchStatistics(botName, botManagerEndpoint);
        }
      }
    }, 300);
  }

  async fetchStatistics(botName, botManagerEndpoint) {
    const url = `${config.pm4botsEndpoint}/bot/${botName}/enhanced-model`;
    console.log(url);
    try {
      const response = await fetch(url, { mode: "no-cors", timeout: 10000 });
      if (!response.ok) {
        this.loading = false;
        return;
      }

      const statistics = await response.json();
      this.loading = false;
      this.statistics = statistics;
    } catch (error) {
      console.error(error);
    }
  }
}

window.customElements.define("canvas-statistics-overlay", CanvasStatsOverlay);
