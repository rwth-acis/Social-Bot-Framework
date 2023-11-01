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

  overlayInitialized = false;

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
    super.firstUpdated();
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    const y = await instance.connect();

    setTimeout(async () => {
      this.y = y;
      this.configMap = y.getMap("pm4bots-config");

      const botModel = y.getMap("data").get("model");
      if (!botModel) return console.warn("bot model not found");
      const botElement = Object.values(botModel.nodes).find((node) => {
        return node.type === "Bot";
      });
      if (!botElement) return console.warn("bot element not found");
      const botName = botElement.label?.value?.value;
      if (!botName) return console.warn("bot name not found");

      this.configMap.set("bot-name", botName);
      const statistics = await this.fetchStatistics(botName);
      if (!statistics) return;
      this.statistics = statistics;
      document
        .querySelector("#bot-usage-button")
        .addEventListener("click", () => {
          setTimeout(() => {
            if (
              !this.overlayInitialized &&
              document.querySelector("#model-statistics-overlay").style
                .display === "block"
            ) {
              this.initializeOverlay(botModel, statistics);
            }
          }, 100);
        });
    }, 300);
  }

  async fetchStatistics(botName) {
    this.loading = true;
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

    const url = `${pm4botsEndpointInput}/bot/${botName}/enhanced-model?bot-manager-url=${botManagerEndpointInput}&event-log-url=${eventLogEndpointInput}`;
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

      if (!response.ok) return;

      const statistics = await response.json();
      return statistics;
    } catch (error) {
      console.error(error);
      this.loading = false;
      return null;
    }
  }

  async initializeOverlay(botModel, statistics) {
    console.log("Initializing statistics overlay");
    window.jsPlumbInstance.setSuspendDrawing(true, true);

    // Add missing edges to bot model as overlay
    const botModelEdges = botModel.edges;
    const botModelNodes = botModel.nodes;
    const boundingBox = getBotModelBoundingBox(botModel);
    const addedNodes = [];
    // add missing nodes to canvas
    for (const node of statistics.graph.nodes) {
      if (!botModelNodes[node.id] && !addedNodes.includes(node.id)) {
        addMissingNode(node, boundingBox);
        addedNodes.push(node.id);
      }
    }

    const addedEdges = [];
    startLoop: for (const edge of statistics.graph.edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      const sourceNode = findNodeHTML(sourceId);
      const targetNode = findNodeHTML(targetId);
      if (!sourceNode || !targetNode) {
        console.error("source or target node not found", sourceId, targetId);
        continue startLoop;
      }

      const botModelEdge = findEdgeInBotModel(
        botModelEdges,
        sourceId,
        targetId
      );
      if (botModelEdge) {
        addOverlayToExistingEdge(
          sourceNode,
          targetNode,
          edge.performance?.mean
        );
      } else if (!findEdgeInAddedEdges(addedEdges, sourceId, targetId)) {
        addMissingEdge(sourceNode, targetNode, edge.performance?.mean);
        addedEdges.push({ sourceId, targetId });
      }
    }

    window.jsPlumbInstance.setSuspendDrawing(false);
    window.jsPlumbInstance.repaintEverything();
    this.overlayInitialized = true;
  }
}

window.customElements.define("canvas-statistics-overlay", CanvasStatsOverlay);

/**
 *  Adds a node to the canvas
 * @param {*} node  node to add
 * @param {*} boundingBox  bounding box of the bot model
 */
function addMissingNode(node, boundingBox) {
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
  nodeHtml.addEventListener("mousedown", () => {
    window.canvas.unbindMoveToolEvents();
  });
  nodeHtml.addEventListener("mouseup", () => {
    window.canvas.bindMoveToolEvents();
  });
}

/**
 *  Adds an edge to the canvas
 * @param {*} source  source node
 * @param {*} target  target node
 * @param {*} meanDuration  mean duration of the edge
 */
function addMissingEdge(source, target, meanDuration) {
  const color = getColorScale(meanDuration, 0, 10);
  // if meanDuration is defined then add an overlay to the edge with the performance value
  const label = meanDuration ? meanDuration.toFixed(2) + "s" : "";
  const strokeWidth = getStrokeWidth(meanDuration, 0, 10);
  window.jsPlumbInstance.connect({
    source: source,
    target: target,
    endpoint: "Dot",
    paintStyle: { stroke: color, strokeWidth },
    cssClass: "pm4bots-edge",
    overlays: [
      { type: "Arrow", options: { location: 1 } },
      { type: "Label", options: { label, location: 0.7 } },
    ],
    scope: "pm4bots",
  });
}

/**
 *  Adds an overlay to an existing edge
 * @param {*} source  source node
 * @param {*} target    target node
 * @param {*} meanDuration  mean duration of the edge
 */
function addOverlayToExistingEdge(source, target, meanDuration) {
  const color = getColorScale(meanDuration, 0, 10);
  // if meanDuration is defined then add an overlay to the edge with the performance value
  const label = meanDuration ? meanDuration.toFixed(2) + "s" : "";
  const strokeWidth = getStrokeWidth(meanDuration, 4, 10);
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
    type: "Label",
    options: {
      label,
      location: 0.6,
    },
  });
}

/**
 *  Finds a node in the canvas
 * @param {*} id  id of the node
 * @returns  node html element
 */
function findNodeHTML(id) {
  return (
    document.querySelector(
      `[id="pm4bots-${id}"]` // added node
    ) || document.querySelector(`[id="${id}"]`)
  ); // existing node
}
/**
 * Finds an edge in the bot model edges
 * @param {*} botModelEdges json of botmodel edges
 * @param {*} sourceId id of the source node
 * @param {*} targetId id of the target node
 * @returns corresponding entry or null if not found
 */
function findEdgeInBotModel(botModelEdges, sourceId, targetId) {
  for (const botModelEdge of Object.values(botModelEdges)) {
    if (botModelEdge.source === sourceId && botModelEdge.target === targetId) {
      return botModelEdge;
    }
  }
  return null;
}
/**
 * Finds an edges in the array of added edges
 * @param {*} addedEdges array of addedEdges
 * @param {*} sourceId id of the source node
 * @param {*} targetId id of the target node
 * @returns corresponding entry or null if not found
 */
function findEdgeInAddedEdges(addedEdges, sourceId, targetId) {
  for (const addedEdge of addedEdges) {
    if (addedEdge.source === sourceId && addedEdge.target === targetId) {
      return addedEdge;
    }
  }
  return null;
}

/**
 *  Returns a color based on the value and a color scale
 * @param {*} value   value to color
 * @param {*} minValue  min value of the color scale
 * @param {*} maxValue  max value of the color scale
 * @returns
 */
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

/**
 *
 * @param {*} value  value to color
 * @param {*} min  min value of the color scale
 * @param {*} max  max value of the color scale
 * @returns  stroke width
 */
function getStrokeWidth(value, min, max) {
  if (!value) {
    return min;
  }
  const width = Math.round(1 + ((value - min) / (max - min)) * 4);
  return width > max ? max : width;
}

/**
 * Returns the smallest bounding box that contains all nodes of the bot model
 */
function getBotModelBoundingBox(botModel) {
  const botModelNodes = botModel.nodes;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [id] of Object.entries(botModelNodes)) {
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
