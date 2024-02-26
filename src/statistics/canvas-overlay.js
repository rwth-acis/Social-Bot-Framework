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
    loading: { type: Boolean, value: true, state: true },
    overlayInitialized: { type: Boolean, value: false, state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    return html` <style>
        .pm4bots-edge-label {
          background-color: white;
          padding: 2px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: bold;
          color: black;
        }
      </style>
      <div
        id="model-statistics-overlay"
        style="display:none; position:absolute; top:0; left:0;right:0;bottom:0; background-color: #e9ecef; padding: 10px; border-radius: 5px;"
      >
        <div
          class="spinner-border text-primary position-absolute"
          role="status"
          style="top:50%;left:50%;"
          ?hidden="${this.loading === false}"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>`;
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
      document.querySelector("#AIrecommendationButton").style.display =
        "inline-block";
      this.statistics = statistics;
      this.setMinMaxValues(statistics);
      this.y.getMap("data").set("bot-statistics", statistics);
      document
        .querySelector("#bot-usage-button")
        .addEventListener("click", () => {
          setTimeout(() => {
            if (
              document.querySelector("#model-statistics-overlay").style
                .display === "block"
            ) {
              if (!this.overlayInitialized) {
                this.initializeOverlay(botModel);
                this.initializeMenu();
              } else {
                this.redrawOverlay();
              }
            } else if (
              document.querySelector("#model-statistics-overlay").style
                .display === "none"
            ) {
              this.removeAllOverlays();
            }
          }, 100);
        });
      if (
        document.querySelector("#model-statistics-overlay").style.display ===
          "block" &&
        !this.overlayInitialized
      ) {
        this.initializeOverlay(botModel);
        this.initializeMenu();
      }
    }, 300);
  }

  setMinMaxValues(statistics) {
    let currDurationMax = 0;
    let currDurationMin = Infinity;
    let currFrequencyMax = 0;
    let currFrequencyMin = Infinity;
    for (const edge of statistics.graph.edges) {
      if (edge.performance > currDurationMax) {
        currDurationMax = edge.performance;
      }
      if (edge.frequency > currFrequencyMax) {
        currFrequencyMax = edge.frequency;
      }
      if (edge.performance < currDurationMin) {
        currDurationMin = edge.performance;
      }
      if (edge.frequency < currFrequencyMin) {
        currFrequencyMin = edge.frequency;
      }
    }
    this.minDurationValue = currDurationMin;
    this.maxDurationValue = currDurationMax > 300 ? 300 : currDurationMax;
    this.minFrequencyValue = currFrequencyMin;
    this.maxFrequencyValue = currFrequencyMax;
  }

  async fetchStatistics(botName) {
    this.loading = true;
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
    const botModel = this.y.getMap("data").get("model");

    const url = `${pm4botsEndpointInput}/bot/${botName}/enhanced-model?bot-manager-url=${botManagerEndpointInput}&event-log-url=${eventLogEndpointInput}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        timeout: 10000,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({'bot-model':botModel}),
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

  initializeOverlay(botModel) {
    const statistics = this.statistics;
    window.jsPlumbInstance.setSuspendDrawing(true, true);

    // Add missing edges to bot model as overlay
    const botModelEdges = botModel.edges;
    const botModelNodes = botModel.nodes;
    const boundingBox = getBotModelBoundingBox(botModel);
    const addedNodes = [];
    // add missing nodes to canvas
    for (const node of statistics.graph.nodes) {
      if (!botModelNodes[node.id] && !addedNodes.includes(node.id)) {
          // addMissingNode(node, boundingBox);
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
          edge.performance,
          this
        );
      } else if (!findEdgeInAddedEdges(addedEdges, sourceId, targetId)) {
        addMissingEdge(sourceNode, targetNode, edge.performance, this);
        addedEdges.push({ sourceId, targetId });
      }
    }

    window.jsPlumbInstance.setSuspendDrawing(false);
    window.jsPlumbInstance.repaintEverything();
    this.overlayInitialized = true;
  }

  initializeMenu() {
    const canvasFrame = document.querySelector("#canvas-frame");
    canvasFrame.style.position = "relative";
    const menuElement = document.createElement("div");
    menuElement.innerHTML = `<select id="pm4bots-overlay-selection" class="form-select" aria-label="Default select example">
        <option selected value="1">Durations (seconds)</option>
        <option value="2">Frequency</option>
    </select>`;
    menuElement.style.position = "absolute";
    menuElement.style.top = "5px";
    menuElement.style.right = "5px";
    menuElement.classList.add("pm4bots-overlay");
    menuElement.style.zIndex = "1000000";
    canvasFrame.appendChild(menuElement);
    menuElement.addEventListener("change", (event) => {
      const value = event.target.value;
      if (value === "1") {
        this.redrawOverlay("duration");
      } else if (value === "2") {
        this.redrawOverlay("frequency");
      }
    });
  }

  removeAllOverlays() {
    window.jsPlumbInstance.setSuspendDrawing(true);

    for (const edge of this.statistics.graph.edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      const sourceNode = findNodeHTML(sourceId);
      const targetNode = findNodeHTML(targetId);
      removeExistingOverlays(sourceNode, targetNode);
    }

    window.jsPlumbInstance.setSuspendDrawing(false);
    setTimeout(() => {
      window.jsPlumbInstance.repaintEverything();
    });
  }

  redrawOverlay(type = "duration") {
    window.jsPlumbInstance.setSuspendDrawing(true);

    for (const edge of this.statistics.graph.edges) {
      const sourceId = edge.source;
      const targetId = edge.target;
      const sourceNode = findNodeHTML(sourceId);
      const targetNode = findNodeHTML(targetId);
      removeExistingOverlays(sourceNode, targetNode);
      if (!sourceNode || !targetNode) {
        console.error("source or target node not found", sourceId, targetId);
      } else {
        const label =
          type === "duration"
            ? edge.performance
              ? edge.performance.toFixed(2) + "s"
              : ""
            : edge.frequency;
        const metric =
          type === "duration"
            ? edge.performance
              ? edge.performance.toFixed(2)
              : 0
            : edge.frequency;
        updateOverlay(sourceNode, targetNode, label, type, this, metric);
      }
    }

    window.jsPlumbInstance.setSuspendDrawing(false);
    setTimeout(() => {
      window.jsPlumbInstance.repaintEverything();
    });
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
  let bgClass = "bg-dark";
  if (!node.label || node.label === "empty" || node.label === "empty_intent") {
    bgClass = "bg-secondary";
    return;
  } else if (node.label === "unrecognizedIntent") {
    bgClass = "bg-warning";
  } else {
    return;
  }
  nodeHtml.classList.add(
    "node",
    "pm4bots-node",
    "border",
    "text-bg-dark",
    bgClass,
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
function addMissingEdge(source, target, meanDuration, that) {
  // no self loops
  if (source === target) {
    return;
  }
  const color = getColorScale(
    meanDuration,
    that.minDurationValue,
    that.maxDurationValue,
    "duration"
  );
  // if meanDuration is defined then add an overlay to the edge with the performance value
  const label = meanDuration ? meanDuration.toFixed(2) + "s" : "";
  const strokeWidth = getStrokeWidth(meanDuration, that.maxDurationValue + 2);
  window.jsPlumbInstance.connect({
    source: source,
    target: target,
    endpoint: "Blank",
    paintStyle: { stroke: color, strokeWidth },
    anchor: "AutoDefault",
    cssClass: "pm4bots-edge",
    overlays: [{ type: "Arrow", options: { location: 1 } }],
    scope: "pm4bots",
  });
  setTimeout(() => {
    window.jsPlumbInstance
      .getConnections({
        source: source,
        target: target,
        scope: "pm4bots",
      })[0]
      .addOverlay({
        type: "Label",
        options: {
          label,
          location: 0.6,
          cssClass: "pm4bots-edge-label",
        },
      });
    window.jsPlumbInstance.repaintEverything();
  }, 10);
}

function updateOverlay(source, target, label, type, that, metric) {
  const connection = retrieveConnection(source, target);
  if (!connection) {
    console.error("connection not found", source, target);
    return;
  }
  const color = getColorScale(
    metric,
    type == "duration" ? that.minDurationValue - 2 : that.minFrequencyValue - 2,
    type == "duration" ? that.maxDurationValue + 2 : that.maxFrequencyValue + 2,
    type
  );

  const strokeWidth = getStrokeWidth(
    metric,
    type == "duration" ? that.maxDurationValue + 2 : that.maxFrequencyValue + 2
  );
  connection.setPaintStyle({ stroke: color, strokeWidth });
  connection.setHoverPaintStyle({
    stroke: color,
    strokeWidth: strokeWidth + 2,
  });
  // remove existing label
  for (const [, overlay] of Object.entries(connection.overlays)) {
    if (overlay.type === "Label") {
      connection.removeOverlay(overlay.id);
    }
  }

  connection.addOverlay({
    type: "Label",
    options: {
      label,
      location: 0.6,
      scope: "pm4bots",
      cssClass: "pm4bots-edge-label",
    },
  });
}

function removeExistingOverlays(source, target) {
  const connection = retrieveConnection(source, target);
  if (!connection) {
    console.error("connection not found", source, target);
    return;
  }
  connection.setPaintStyle({ stroke: "black", strokeWidth: 4 });
  for (const [, overlay] of Object.entries(connection.overlays)) {
    if (overlay.type === "Label") {
      connection.removeOverlay(overlay.id);
    }
  }
}

function retrieveConnection(source, target) {
  let connection = window.jsPlumbInstance.getConnections({
    source: source,
    target: target,
  })[0];
  if (!connection)
    connection = window.jsPlumbInstance.getConnections({
      source: source,
      target: target,
      scope: "pm4bots",
    })[0];
  return connection;
}

/**
 *  Adds an overlay to an existing edge
 * @param {*} source  source node
 * @param {*} target    target node
 * @param {*} meanDuration  mean duration of the edge
 */
function addOverlayToExistingEdge(source, target, meanDuration, that) {
  const color = getColorScale(
    meanDuration,
    that.minDurationValue - 2,
    that.maxDurationValue + 2,
    "duration"
  );
  // if meanDuration is defined then add an overlay to the edge with the performance value
  const label = meanDuration ? meanDuration.toFixed(2) + "s" : "";
  const strokeWidth = getStrokeWidth(meanDuration, that.maxDurationValue + 2);
  const connection = retrieveConnection(source, target);
  if (!connection) {
    console.error("connection not found", source, target);
    return;
  }
  connection.setPaintStyle({ stroke: color, strokeWidth });
  connection.setHoverPaintStyle({
    stroke: color,
    strokeWidth: strokeWidth + 2,
  });
  connection.addOverlay({
    type: "Label",
    options: {
      label,
      location: 0.8,
      cssClass: "pm4bots-edge-label",
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
function getColorScale(value, minValue, maxValue, type) {
  if (!value) {
    return "#456";
  }
  const colorStops =
    type === "duration"
      ? durationsColorMap(minValue, maxValue)
      : frequencyColorMap(minValue, maxValue);

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
function getStrokeWidth(value, max) {
  max = Math.min(max, 60);
  value = Math.min(value, max);
  if (!value || !max) {
    return 1;
  }
  // get value between 2 and 10
  return (value / max) * 8 + 2;
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

const durationsColorMap = (minValue, maxValue) => [
  // Grey
  { value: minValue, color: [128, 128, 128] },
  // Yellow
  { value: minValue + (maxValue - minValue) / 3, color: [255, 255, 0] },
  // Orange
  { value: minValue + (2 * (maxValue - minValue)) / 3, color: [255, 165, 0] },
  // Red
  { value: maxValue, color: [255, 0, 0] },
];

const frequencyColorMap = (minValue, maxValue) => [
  // Grey
  { value: minValue, color: [128, 128, 128] },
  // light blue
  { value: minValue + (maxValue - minValue) / 3, color: [0, 255, 255] },
  // blue
  { value: minValue + (2 * (maxValue - minValue)) / 3, color: [0, 0, 255] },
  // dark blue
  { value: maxValue, color: [0, 0, 128] },
];
