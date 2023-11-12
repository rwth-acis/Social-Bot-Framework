import { LitElement, html } from "lit";
import "./bot.manager.widget.js";
import "@rwth-acis/syncmeta-widgets";
import config from "../config.json";
import { Common } from "./common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { ifDefined } from "lit/directives/if-defined.js";
import "./statistics/improvements-recommender.js";
/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = {
    loading: { type: Boolean, value: true },
  };
  edgeLabels;
  edgeTypes;
  edgeInfoShown = true;

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <style>
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
        yjsHost="${config.yjs_host}"
        yjsPort="${config.yjs_port}"
        yjsProtocol="${config.yjs_socket_protocol}"
        yjsSpaceTitle="${ifDefined(
          Common.getYjsRoom() === null ? undefined : Common.getYjsRoom()
        )}"
      ></widget-container>
      <button
        type="button"
        class="btn btn-success rounded shadow-lg position-fixed bottom-0 end-0 m-2"
        style="display: none;"
        id="AIrecommendationButton"
        @click="${() => {
          this.Offcanvas.show();
        }}"
      >
        <i class="bi bi-lightbulb fs-3"></i>
      </button>

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="offCanvasChatGPT"
        aria-labelledby="offcanvasRightLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasRightLabel">
            ChatGPT Recommendations
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="${() => {
              this.Offcanvas.hide();
            }}"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <bot-improvements></bot-improvements>
        </div>
      </div>
    `;
  }
  async firstUpdated() {
    this.Offcanvas = new bootstrap.Offcanvas("#offCanvasChatGPT");
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    const y = await instance.connect();
    super.firstUpdated();

    setTimeout(() => {
      const botModel = y.getMap("data").get("model");
      if (botModel) {
        const botElement = Object.values(botModel.nodes).find((node) => {
          return node.type === "Bot";
        });
        if (botElement) {
          this.insertUsageButton();
          const overelay = document.createElement("canvas-statistics-overlay");
          const canvasContainer = document.querySelector("#canvas");
          canvasContainer.appendChild(overelay);
        }
      }
    }, 500);
  }
  insertUsageButton() {
    const firstButtonCol = document.querySelector(
      "#main-widget-utilities-container  > div:nth-child(1)"
    ); // get the first button column in the canvas widget container
    if (firstButtonCol) {
      const newButton = document.createElement("button");
      newButton.classList.add("btn", "btn-primary", "btn-sm", "ml-2");
      newButton.id = "bot-usage-button";
      newButton.innerHTML = "<i class='bi bi-graph-up'></i> Usage ";
      newButton.addEventListener("click", () => {
        window.jsPlumbInstance.setSuspendDrawing(true, true);
        this.toggleEdgeInfoLabels();
        const overlay = document.querySelector("#model-statistics-overlay");
        const pm4botsOverlayElements =
          document.querySelectorAll(".pm4bots-overlay");
        const nodes = document.querySelectorAll(".pm4bots-node");

        if (overlay.style.display === "none") {
          for (const node of nodes) {
            node.style.display = "block";
          }
          overlay.style.display = "block";
          for (const el of pm4botsOverlayElements) {
            el.style.display = "block";
          }
          window.jsPlumbInstance.select({ scope: "pm4bots" }).setVisible(true);
        } else {
          for (const node of nodes) {
            node.style.display = "none";
          }
          overlay.style.display = "none";
             for (const el of pm4botsOverlayElements) {
               el.style.display = "none";
             }
          window.jsPlumbInstance.select({ scope: "pm4bots" }).setVisible(false);
        }
        window.jsPlumbInstance.setSuspendDrawing(false);
      });
      firstButtonCol.appendChild(newButton);
    }
  }

  toggleEdgeInfoLabels() {
    if (!this.edgeLabels) {
      this.edgeLabels = document.querySelectorAll(".edge_label");
    }
    if (!this.edgeTypes) {
      this.edgeTypes = document.querySelectorAll(".type");
    }
    this.edgeInfoShown = Array.from(this.edgeLabels).some(
      (edgeLabel) => edgeLabel.style.display !== "none"
    ); // check if any of the edge labels are shown
    for (const edgeLabel of this.edgeLabels) {
      if (this.edgeInfoShown) {
        edgeLabel.style.display = "none";
      } else {
        edgeLabel.style.display = "block";
      }
    }
    for (const edgeType of this.edgeTypes) {
      if (this.edgeInfoShown) {
        edgeType.style.display = "none";
      } else {
        edgeType.style.display = "block";
      }
    }
    this.edgeInfoShown = !this.edgeInfoShown;
  }

  toggleEdgeStatistics() {}
}

window.customElements.define("bot-modeling", BotModeling);
