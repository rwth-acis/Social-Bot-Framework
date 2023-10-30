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
    const eventLogEndpointInput = this.configMap
      .get("event-log-endpoint")
      .toString();
    if (!pm4botsEndpointInput || !botManagerEndpointInput) {
      console.warn(
        "endpoints not configured  properly",
        this.configMap.toJSON()
      );
      return;
    }

    const url = `${pm4botsEndpointInput}/bot/${botName}/enhanced-model?bot-manager-url=${botManagerEndpoint}&event-log-url=${eventLogEndpointInput}`;
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
      document
        .querySelector("#bot-usage-button")
        .addEventListener("click", () => {
          setTimeout(() => {
            if (
              !this.drawn &&
              document.querySelector("#model-statistics-overlay").style
                .display === "block"
            ) {
              this.addMissingNodesAndEdges();
            }
          }, 100);
        });
    } catch (error) {
      console.error(error);
    }
  }

  addMissingNodesAndEdges() {
    const statistics = this.statistics;
    window.jsPlumbInstance.setSuspendDrawing(true, true);
    // Add missing edges to bot model as overlay
    const botModel = this.y.getMap("data").get("model");
    const botModelEdges = botModel.edges;
    const botModelNodes = botModel.nodes;
    const boundingBox = this.getBotModelBoundingBox();
    const addedNodes = [];
    // add missing nodes to canvas
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
    startLoop: for (const edge of statistics.graph.edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      const sourceNode = this.findNode(sourceId);
      const targetNode = this.findNode(targetId);
      if (!sourceNode || !targetNode) {
        console.error("source or target node not found", sourceId, targetId);
        continue startLoop;
      }

      const botModelEdge = this.findEdgeInBotModel(
        botModelEdges,
        sourceId,
        targetId
      );
      if (botModelEdge) {
        this.addOverlayToExistingEdge(sourceNode, targetNode, edge.performance);
      } else {
        if (this.findEdgeInAddedEdges(addedEdges, sourceId, targetId)) {
          continue startLoop;
        }
        addedEdges.push({ sourceId, targetId });
        this.addMissingEdge(sourceNode, targetNode, edge.performance);
      }
    }
    // window.jsPlumbInstance.select({ scope: "pm4bots" }).setVisible(false);
    window.jsPlumbInstance.setSuspendDrawing(false);
    this.drawn = true;
  }

  findNode(id) {
    return (
      document.querySelector(
        `[id="pm4bots-${id}"]` // added node
      ) || document.querySelector(`[id="${id}"]`)
    ); // existing node
  }

  findEdgeInBotModel(botModelEdges, sourceId, targetId) {
    for (const botModelEdge of Object.values(botModelEdges)) {
      if (
        botModelEdge.source === sourceId &&
        botModelEdge.target === targetId
      ) {
        return botModelEdge;
      }
    }

    return null;
  }

  findEdgeInAddedEdges(addedEdges, sourceId, targetId) {
    for (const addedEdge of addedEdges) {
      if (addedEdge.source === sourceId && addedEdge.target === targetId) {
        return addedEdge;
      }
    }

    return null;
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
    const y = boundingBox.maxY + Math.random() * 180;
    nodeHtml.style.left = x + "px";
    nodeHtml.style.top = y + "px";
    const canvas = document.querySelector("#canvas");
    canvas.appendChild(nodeHtml);
    window.jsPlumbInstance.manage(nodeHtml);
    //hide
    // nodeHtml.style.display = "none";
    // when dragging the node prevent canvas panning
    nodeHtml.addEventListener("mousedown", (event) => {
      window.canvas.unbindMoveToolEvents();
    });
    nodeHtml.addEventListener("mouseup", (event) => {
      window.canvas.bindMoveToolEvents();
    });
  }

  addMissingEdge(source, target, performance) {
    const color = getColorScale(performance?.mean, 0, 10);
    // if performance?.mean is defined then add an overlay to the edge with the performance value
    const label = performance?.mean ? performance?.mean.toFixed(2) + "s" : "";
    const strokeWidth = getStrokeWidth(performance?.mean, 0, 10);
    window.jsPlumbInstance.connect({
      source: source,
      target: target,
      endpoint: "Dot",
      paintStyle: { stroke: color, strokeWidth },
      cssClass: "pm4bots-edge",
      overlays: [
        { type: "Arrow", options: { location: 1 } },
        { type: "Label", options: { label,location:0.7 } },
      ],
      scope: "pm4bots",
    });
  }
  addOverlayToExistingEdge(source, target, performance) {
    const color = getColorScale(performance?.mean, 0, 10);
    // if performance?.mean is defined then add an overlay to the edge with the performance value
    const label = performance?.mean ? performance?.mean.toFixed(2) + "s" : "";
    const strokeWidth = getStrokeWidth(performance?.mean, 10, 15);
    const connection = window.jsPlumbInstance.getConnections({
      source: source,
      target: target,
    })[0];
    connection.setPaintStyle({ stroke: color, strokeWidth });
    connection.setHoverPaintStyle({
      stroke: color,
      strokeWidth: strokeWidth + 2,
    });
    connection.addOverlay({
      type: "Custom",
      options: {
        create: function () {
          const el = document.createElement("div");
          el.classList.add("edge_label");
          el.innerText = label;
          el.zIndex = 1000;
          return el;
        },
        location: 0.6,
        id: "label",
      },
    });
    // repaint the connection
    window.jsPlumbInstance.repaintEverything();
  }
}

function getColorScale(value, minValue, maxValue) {
  if (!value) {
    return "#456";
  }
  const colorStops = [
    { value: minValue, color: [128, 128, 128] }, // Grey
    { value: minValue + (maxValue - minValue) / 3, color: [255, 255, 0] }, // Yellow
    { value: minValue + (2 * (maxValue - minValue)) / 3, color: [255, 165, 0] }, // Orange
    { value: maxValue, color: [255, 0, 0] }, // Red
  ];

  // Find the appropriate color stop based on the value
  let color;
  for (let i = 1; i < colorStops.length; i++) {
    if (value <= colorStops[i].value) {
      const lowerStop = colorStops[i - 1];
      const upperStop = colorStops[i];

      // Interpolate between the two color stops
      const ratio =
        (value - lowerStop.value) / (upperStop.value - lowerStop.value);
      color = [
        Math.round(
          lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * ratio
        ),
        Math.round(
          lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * ratio
        ),
        Math.round(
          lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * ratio
        ),
      ];
      break;
    }
  }
  if (!color) {
    color = colorStops[colorStops.length - 1].color;
  }
  // Convert the color to a CSS RGB string
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}
function getStrokeWidth(value, min, max) {
  if (!value) {
    return min;
  }
  const width = Math.round(1 + ((value - min) / (max - min)) * 4);
  return width > max ? max : width;
}
window.customElements.define("canvas-statistics-overlay", CanvasStatsOverlay);
