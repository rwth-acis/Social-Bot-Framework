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
    const botManagerEndpointInput = this.configMap
      .get("sbm-endpoint")
      .toString();
    const pm4botsEndpointInput = this.configMap
      .get("pm4bots-endpoint")
      .toString();
    console.log(this.configMap.toJSON());
    if (!pm4botsEndpointInput || !botManagerEndpointInput) {
      console.warn(
        "endpoints not configured  properly",
        this.configMap.toJSON()
      );
      return;
    }

    const url = `${pm4botsEndpointInput}/bot/${botName}/enhanced-model?bot-manager-url=${botManagerEndpoint}`;
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
      this.loading = false;

      if (!response.ok) {
        return;
      }

      const statistics = await response.json();
      this.statistics = statistics;
      this.addMissingNodesAndEdges(statistics);
    } catch (error) {
      console.error(error);
    }
  }

  addMissingNodesAndEdges(statistics) {
    window.jsPlumbInstance.setSuspendDrawing(true, true);
    // Add missing edges to bot model as overlay
    const botModel = this.y.getMap("data").get("model");
    const botModelEdges = botModel.edges;
    const botModelNodes = botModel.nodes;
    const boundingBox = this.getBotModelBoundingBox();
    const addedNodes = [];
    for (const node of statistics.graph.nodes) {
      if (!botModelNodes[node.id]) {
        if (!addedNodes.includes(node.id)) {
          this.addMissingNode(node, boundingBox);
          addedNodes.push(node.id);
        }
      } else {
        botModelNodes[node.id].statistics = {
          avg_confidence: node.avg_confidence,
        };
      }
    }

    const addedEdges = [];

    statloop: for (const edge of statistics.graph.edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      let existingEdge = false;

      for (const botModelEdge of Object.values(botModelEdges)) {
        if (
          botModelEdge.source === sourceId &&
          botModelEdge.target === targetId
        ) {
          botModelEdge.statistics = edge.performance;
          existingEdge = true;
        }
        if (!existingEdge) {
          addedEdges.push({ sourceId, targetId });
          const sourceNode =
            document.querySelector(
              `[id="pm4bots-${sourceId}"]` // added node
            ) || document.querySelector(`[id="${sourceId}"]`); // existing node
          const targetNode =
            document.querySelector(
              `[id="pm4bots-${targetId}"]` // added node
            ) || document.querySelector(`[id="${targetId}"]`); // existing node
          if (!sourceNode || !targetNode) {
            console.error(
              "source or target node not found",
              sourceId,
              targetId
            );
          }
          this.addMissingEdge(sourceNode, targetNode);
          continue statloop;
        }
      }
    }
    window.jsPlumbInstance.select({ scope: "pm4bots" }).setVisible(false);
    window.jsPlumbInstance.setSuspendDrawing(false);
  }

  /**
   * Returns the smallest bounding box that contains all nodes of the bot model
   */
  getBotModelBoundingBox() {
    const botModel = this.y.getMap("data").get("model");
    const botModelNodes = botModel.nodes;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [id, node] of Object.entries(botModelNodes)) {
      const nodeHtml = document.getElementById(id);
      if (!nodeHtml) {
        continue;
      }
      const nodeX = nodeHtml.offsetLeft;
      const nodeY = nodeHtml.offsetTop;
      if (nodeX < minX) {
        minX = nodeX;
      }
      if (nodeY < minY) {
        minY = nodeY;
      }
      if (nodeX > maxX) {
        maxX = nodeX;
      }
      if (nodeY > maxY) {
        maxY = nodeY;
      }
    }
    return { minX, minY, maxX, maxY };
  }

  addMissingNode(node, boundingBox) {
    const nodeHtml = document.createElement("div");
    nodeHtml.id = "pm4bots-" + node.id;
    node.queryId = nodeHtml.id;
    nodeHtml.classList.add(
      "node",
      "pm4bots-node",
      "border",
      "text-bg-dark",
      "p-2",
      "rounded-pill"
    );
    nodeHtml.innerText = node.label;

    // set position randomly on the canvas but close to the bounding box of the bot model
    const x =
      boundingBox.minX + Math.random() * (boundingBox.maxX - boundingBox.minX);
    const y = boundingBox.minY - 80;
    nodeHtml.style.left = x + "px";
    nodeHtml.style.top = y + "px";
    const canvas = document.querySelector("#canvas");
    canvas.appendChild(nodeHtml);
    window.jsPlumbInstance.manage(nodeHtml);
    //hide
    nodeHtml.style.display = "none";
    // when dragging the node prevent canvas panning
    nodeHtml.addEventListener("mousedown", (event) => {
      window.canvas.unbindMoveToolEvents();
    });
    nodeHtml.addEventListener("mouseup", (event) => {
      window.canvas.bindMoveToolEvents();
    });
  }

  addMissingEdge(source, target) {
    window.jsPlumbInstance.connect({
      source: source,
      target: target,
      endpoint: "Dot",
      paintStyle: { stroke: "#456", strokeWidth: 2 },
      cssClass: "pm4bots-edge",
      overlays: [{ type: "Arrow", options: { location: 1 } }],
      scope: "pm4bots",
    });
  }
}

window.customElements.define("canvas-statistics-overlay", CanvasStatsOverlay);
