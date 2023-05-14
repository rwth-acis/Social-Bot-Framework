import { LitElement, html } from "lit";
import "./bot.manager.widget.js";
import "@rwth-acis/syncmeta-widgets";
import config from "../config.json";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
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
    const host = config.yjs_address.includes("http")
      ? config.yjs_address.split("/")[2].split(":")[0]
      : config.yjs_address.split(":")[0];
    const port = config.yjs_address.includes("http")
      ? config.yjs_address.split("/")[2].split(":")[1]
      : config.yjs_address.split(":")[1];
    return html` <style>
        .maincontainer {
          min-height: 55vh;
          resize: both;
          overflow: hidden;
          position: relative;
        }
        .col {
          padding: 0;
        }

        .maincontainer > .row {
          height: inherit;
          min-height: inherit;
        }

        #modelOpsContainer {
          resize: vertical;
          overflow: hidden;
          position: relative;
        }
        .resize-icon {
          position: absolute;
          right: 0;
          bottom: 0;
          z-index: 1;
        }
      </style>
      <div
        class="container-fluid  card card-body shadow-sm mb-4"
        id="modelOpsContainer"
      >
        <bot-manager-widget></bot-manager-widget>
      </div>
      <widget-container
        yjsHost="${host}"
        yjsPort="${port}"
        yjsProtocol="${config.yjs_socket_protocol}"
        yjsSpaceTitle="${window.spaceTitle}"
      ></widget-container>`;
  }
  firstUpdated() {
    super.firstUpdated();
  }
}

window.customElements.define("bot-modeling", BotModeling);
