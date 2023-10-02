import { LitElement, html } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import interact from "interactjs";
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
    return html` <div class="container-fluid ">
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

        <div class="col-4">
          <div class="row">
            <h3>Bot statistics works</h3>
          </div>
          <div class="row">
            <h3>Community statistics</h3>
            <div class="mb-3">
              <label for="exampleFormControlInput1" class="form-label"
                >Service name</label
              >
              <input
                type="text"
                class="form-control"
                id="groupId"
                placeholder="mensa"
                value="mensa"
                disabled
              />
            </div>
            <div class="mb-3">
              <label for="exampleFormControlInput2" class="form-label"
                >Group Id</label
              >
              <input
                type="text"
                class="form-control"
                id="serviceId"
                placeholder="mensa"
                value="343da947a6db1296fadb5eca3987bf71f2e36a6d088e224a006f4e20e6e7935bb0d5ce0c13ada9966228f86ea7cc2cf3a1435827a48329f46b0e3963213123e0"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>`;
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
          const groupId = document.getElementById("groupId").value;
          const serviceId = document.getElementById("serviceId").value;
          this.fetchSuccessModel(botName, groupId, serviceId);
        }
      }
    }, 300);
  }

  async fetchSuccessModel(botName, groupID, serviceId) {
    const url = `${config.pm4botsEndpoint}/bot/${botName}/success-model?group-id=${groupID}&service-id=${serviceId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const successModelXMl = await res.json().xml;
    console.log(successModelXMl);
  }

  async getSuccessMeasureList(botName, groupID, serviceId) {
    const xml = await this.fetchSuccessModel(botName, groupID, serviceId);
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
}

window.customElements.define("bot-statistics", BotStats);
