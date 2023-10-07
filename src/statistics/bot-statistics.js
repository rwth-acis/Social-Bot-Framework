import { LitElement, html } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import interact from "interactjs";
import "./config-pane.js";
/**
 * @customElement
 *
 */
class BotStats extends LitElement {
  static properties = {
    loading: { type: Boolean, value: true },
  };
  configModal = null;

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <style>
        #measure-list {
          overflow-y: scroll;
          padding-left: 12px;
          padding-right: 12px;
          width: 100%;
        }
        .list-group-item {
          overflow-x: scroll;
        }
      </style>
      <div class="container-fluid position-relative">
        <div
          class="floaty-div"
          style="position: absolute; top: 2px; right: 2px;"
        >
          <button
            type="button"
            class="btn btn-light shadow border"
            @click="${this.showConfigDialog}"
          >
            <i class="bi bi-gear"></i>
          </button>
        </div>
        <div class="row mh-100">
          <div
            class="col-8  border border-3 rounded p-6 overflow-hidden mh-100 position-relative"
            style="height:98vh;position:relative;"
            style=""
            id="pm-res"
          >
            <div
              class="spinner-border position-absolute"
              role="status"
              style="top:50%;left:50%;"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div class="col-4" style="height:98vh;overflow-y:auto">
            <div class="row h-50">
              <h3>Bot statistics</h3>
            </div>
            <div class="row h-50">
              <h3>Community statistics</h3>

              <div class="input-group mb-3" style="max-height:30px">
                <input
                  type="text"
                  class="form-control"
                  aria-label="search measures"
                  @change="${(e) => this.filterList(e.target)}"
                />
                <span class="input-group-text"
                  ><i class="bi bi-search"></i
                ></span>
              </div>

              <ul class="list-group" id="measure-list"></ul>
            </div>
          </div>
        </div>
      </div>

      <div
        class="modal fade"
        id="configModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-body">
              <div class="d-flex justify-content-end">
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <pm4bots-config></pm4bots-config>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  async firstUpdated() {
    this.configModal = new bootstrap.Modal("#configModal");

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
      this.configMap = y.getMap("pm4bots-config");
      const botManagerEndpoint = y.getText("sbfManager").toString();

      const botModel = y.getMap("data").get("model");
      if (botModel) {
        const botElement = Object.values(botModel.nodes).find((node) => {
          return node.type === "Bot";
        });
        if (botElement) {
          const botName = botElement.label.value.value;
          this.fetchStatistics(botName, botManagerEndpoint);
          this.getSuccessMeasureList(botName);
          this.fetchMeasureCatalog(botName);
        }
      }
    }, 300);
  }

  async fetchSuccessModel(botName) {
    const groupId = this.configMap.get("group-id").toString();
    const serviceId = this.configMap.get("service-name").toString();
    const successModelEndpoint = this.configMap
      .get("success-modeling-endpoint")
      .toString();

    if (!successModelEndpoint) {
      return;
    }
    const url = joinAbsoluteUrlPath(
      successModelEndpoint,
      "models",
      groupId,
      serviceId
    );

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: toAuthorizationHeader(botName),
      },
    });
    if (!res.ok) {
      return;
    }
    const body = await res.json();
    const successModelXMl = body.xml;
    return successModelXMl;
  }

  async fetchMeasureCatalog(botName) {
    const groupId = this.configMap.get("group-id").toString();
    const successModelEndpoint = this.configMap
      .get("success-modeling-endpoint")
      .toString();
    const url = joinAbsoluteUrlPath(successModelEndpoint, "measures", groupId);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: toAuthorizationHeader(botName),
      },
    });
    if (!res.ok) {
      return;
    }
    const body = await res.json();
    const xmlString = body.xml;
    const measureNames = parseMeasures(xmlString);
    return measureNames;
  }

  async getSuccessMeasureList(botName) {
    const res = await this.fetchSuccessModel(botName);
    const xmlString = res;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const measureNames = Array.from(xmlDoc.getElementsByTagName("measure")).map(
      (measure) => measure.getAttribute("name")
    );
    this.measures = measureNames;
    // add them to the list
    const list = document.getElementById("measure-list");
    measureNames.forEach((measureName) => {
      const option = document.createElement("li");
      option.value = measureName;
      option.classList.add("list-group-item");
      option.innerText = measureName;
      list.appendChild(option);
    });
  }

  filterList(input) {
    const list = document.getElementById("measure-list");
    const filter = input.value.toUpperCase();
    const options = list.getElementsByTagName("li");
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const txtValue = option.textContent || option.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        option.style.display = "";
      } else {
        option.style.display = "none";
      }
    }
  }

  async fetchStatistics(botName, botManagerEndpoint) {
    // botManagerEndpoint = "http://social-bot-manager:8080/SBFManager";
    const url = `${config.pm4botsEndpoint}/bot/${botName}/petri-net?bot-manager-url=${botManagerEndpoint}`;
    console.log(url);
    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Accept: "text/html",
        },
      });
      if (!response.ok) {
        this.loading = false;
        return;
      }
      const element = document.getElementById("pm-res");

      document.getElementById("pm-res").innerHTML = await response.text();
      const svg = document.getElementById("pm-res").querySelector("svg");
      svg.style.position = "absolute";
      // set height and width of svg to that of the child
      svg.width.baseVal.value = svg.getBBox().width;
      svg.height.baseVal.value = svg.getBBox().height;
      this.centerElement(svg);
      // zoom on scroll
      svg.parentElement.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.zoomIn(element);
        }
        if (e.deltaY > 0) {
          this.zoomOut(element);
        }
      });
      // set z index of parent frame above the svg
      svg.parentElement.style.zIndex = 1;
      this.makeDraggable(svg);
    } catch (error) {
      console.error(error);
    }
  }
  centerElement(element) {
    const bbox = element.getBBox();
    element.parentElement.scrollTo(
      bbox.x + bbox.width / 2,
      bbox.y + bbox.height / 2
    );
  }

  zoomIn(element) {
    const svg = element.querySelector("svg");
    svg.width.baseVal.value = svg.width.baseVal.value * 1.1;
    svg.height.baseVal.value = svg.height.baseVal.value * 1.1;
  }
  zoomOut(element) {
    const svg = element.querySelector("svg");
    svg.width.baseVal.value = svg.width.baseVal.value * 0.9;
    svg.height.baseVal.value = svg.height.baseVal.value * 0.9;
  }
  makeDraggable(element) {
    interact(element).draggable({
      onmove: function (event) {
        const target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // translate the element
        target.style.transform = "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },

      // 'xy' by default - any direction
      startAxis: "xy",

      lockAxis: "xy",

      max: 1,
    });
  }

  showConfigDialog() {
    this.configModal.show();
  }
  hideConfigDialog() {
    this.configModal.hide();
  }
}

window.customElements.define("bot-statistics", BotStats);

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
function parseMeasures(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const measures = Array.from(xmlDoc.getElementsByTagName("measure")).map(
    (measure) => {
      const name = measure.getAttribute("name");
      const tags = measure.getAttribute("tags");
      const type = measure.getAttribute("type");
      const description = measure
        .getElementsByTagName("description")[0]
        .textContent.trim();
      const query =
        measure.getElementsByTagName("query")[0]?.textContent?.trim() || null;
      const visualization = measure.getElementsByTagName("visualization")[0];
      const visualizationType = visualization.getAttribute("type");
      const visualizationUnit =
        visualization.getElementsByTagName("unit")[0]?.textContent?.trim() ||
        null;
      const chartType =
        visualization
          .getElementsByTagName("chartType")[0]
          ?.textContent?.trim() || null;
      const chartTitle =
        visualization
          .getElementsByTagName("chartTitle")[0]
          ?.textContent?.trim() || null;
      const chartXAxisLabel =
        visualization
          .getElementsByTagName("chartXAxisLabel")[0]
          ?.textContent?.trim() || null;
      const chartYAxisLabel =
        visualization
          .getElementsByTagName("chartYAxisLabel")[0]
          ?.textContent?.trim() || null;

      return {
        name,
        tags,
        type,
        description,
        query,
        visualization: {
          type: visualizationType,
          unit: visualizationUnit,
          chartType,
          chartTitle,
          chartXAxisLabel,
          chartYAxisLabel,
        },
      };
    }
  );

  return measures;
}