import { LitElement, html } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import "pm4js/dist/pm4js_latest_w.js";
/**
 * @customElement
 *
 */
class BotStats extends LitElement {
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
    return html` <div class="container-fluid">Bot statistics works</div>`;
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

    setTimeout(() => {
      const botManagerEndpoint = y.getText("sbfManager").toString();

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
    botManagerEndpoint = "http://social-bot-manager:8080/SBFManager";
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
    } catch (error) {
      console.error(error);
    }
  }
}

window.customElements.define("bot-statistics", BotStats);
