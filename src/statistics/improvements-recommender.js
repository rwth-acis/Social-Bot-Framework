import { LitElement, html, css } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
class ImprovementRec extends LitElement {
  static styles = css``;

  createRenderRoot() {
    return this;
  }

  static properties = {
    loading: { type: Boolean, state: true, value: false },
    chatGPTRes: { type: String, state: true, value: false },
  };

  openaiToken = null;

  render() {
    return html`
      <p class="d-inline-flex gap-1">
        <a
          class="btn btn-primary"
          data-bs-toggle="collapse"
          href="#collapseExample"
          role="button"
          aria-expanded="false"
          aria-controls="collapseExample"
        >
          <i class="bi bi-gear"></i>
        </a>
      </p>
      <div class="collapse" id="collapseExample">
        <form @submit="${this.onSubmit}">
          <div class="input-group mb-3">
            <input
              type="password"
              class="form-control"
              placeholder="OpenAI token"
              id="openai-token"
              aria-label="token"
            />
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="flexCheckDefault"
            />
            <label class="form-check-label" for="flexCheckDefault">
              Store token locally
            </label>
          </div>
          <button type="submit" class="btn btn-primary">
            Set <i class="bi bi-check ms-1"></i>
          </button>
          <button
            type="button"
            @click="${() => {
              localStorage.removeItem("openai-token");
              this.openaiToken = null;
              document.querySelector("#openai-token").value = "";
            }}"
            class="btn btn-danger"
          >
            Remove <i class="bi bi-trash ms-1"></i>
          </button>
        </form>
      </div>
      <hr />
      <button
        type="button"
        id="askGPTButton"
        class="btn btn-info mb-2"
        @click="${this.askGPT}"
      >
        Ask ChatGPT
        <svg width="24px" height="24px" viewBox="140 140 520 520">
          <path
            d="m617.24 354a126.36 126.36 0 0 0 -10.86-103.79 127.8 127.8 0 0 0 -137.65-61.32 126.36 126.36 0 0 0 -95.31-42.49 127.81 127.81 0 0 0 -121.92 88.49 126.4 126.4 0 0 0 -84.5 61.3 127.82 127.82 0 0 0 15.72 149.86 126.36 126.36 0 0 0 10.86 103.79 127.81 127.81 0 0 0 137.65 61.32 126.36 126.36 0 0 0 95.31 42.49 127.81 127.81 0 0 0 121.96-88.54 126.4 126.4 0 0 0 84.5-61.3 127.82 127.82 0 0 0 -15.76-149.81zm-190.66 266.49a94.79 94.79 0 0 1 -60.85-22c.77-.42 2.12-1.16 3-1.7l101-58.34a16.42 16.42 0 0 0 8.3-14.37v-142.39l42.69 24.65a1.52 1.52 0 0 1 .83 1.17v117.92a95.18 95.18 0 0 1 -94.97 95.06zm-204.24-87.23a94.74 94.74 0 0 1 -11.34-63.7c.75.45 2.06 1.25 3 1.79l101 58.34a16.44 16.44 0 0 0 16.59 0l123.31-71.2v49.3a1.53 1.53 0 0 1 -.61 1.31l-102.1 58.95a95.16 95.16 0 0 1 -129.85-34.79zm-26.57-220.49a94.71 94.71 0 0 1 49.48-41.68c0 .87-.05 2.41-.05 3.48v116.68a16.41 16.41 0 0 0 8.29 14.36l123.31 71.19-42.69 24.65a1.53 1.53 0 0 1 -1.44.13l-102.11-59a95.16 95.16 0 0 1 -34.79-129.81zm350.74 81.62-123.31-71.2 42.69-24.64a1.53 1.53 0 0 1 1.44-.13l102.11 58.95a95.08 95.08 0 0 1 -14.69 171.55c0-.88 0-2.42 0-3.49v-116.68a16.4 16.4 0 0 0 -8.24-14.36zm42.49-63.95c-.75-.46-2.06-1.25-3-1.79l-101-58.34a16.46 16.46 0 0 0 -16.59 0l-123.31 71.2v-49.3a1.53 1.53 0 0 1 .61-1.31l102.1-58.9a95.07 95.07 0 0 1 141.19 98.44zm-267.11 87.87-42.7-24.65a1.52 1.52 0 0 1 -.83-1.17v-117.92a95.07 95.07 0 0 1 155.9-73c-.77.42-2.11 1.16-3 1.7l-101 58.34a16.41 16.41 0 0 0 -8.3 14.36zm23.19-50 54.92-31.72 54.92 31.7v63.42l-54.92 31.7-54.92-31.7z"
            fill="#000000"
          ></path>
        </svg>
      </button>
      <br />
      <div class="spinner-border" role="status" ?hidden="${!this.loading}">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div
        id="chatgptRes"
        ?hidden="${this.loading || !this.chatGPTRes}"
        class="card card-body mt-2"
      ></div>
    `;
  }

  onSubmit(e) {
    e.preventDefault();
    if (e.target[1].checked) {
      localStorage.setItem("openai-token", e.target[0].value);
    }
    this.openaiToken = e.target[0].value;
  }

  async firstUpdated() {
    const token = localStorage.getItem("openai-token");
    if (token) {
      document.querySelector("#openai-token").value = token;
      this.openaiToken = token;
      document.querySelector("#flexCheckDefault").checked = true;
    }
    super.firstUpdated();
    const instance = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoom(),
    });
    this.y = await instance.connect();
    setTimeout(() => {
      this.statistics = this.y.getMap("data").get("statistics");
      this.configMap = y.getMap("pm4bots-config");
    }, 100);
  }

  async askGPT() {
    this.loading = true;
    document.querySelector("#askGPTButton").disabled = true;
    this.fetchRecommendations();
    setTimeout(() => {
      document.querySelector("#askGPTButton").disabled = false;
      this.loading = false;
    }, 50000);
  }

  async fetchRecommendations() {
    const eventLogEndpointInput = this.configMap
      .get("event-log-endpoint")
      .toString();
    const pm4botsEndpointInput = this.configMap
      .get("pm4bots-endpoint")
      .toString();

    const botName = this.configMap.get("bot-name").toString();
    if (!botName) {
      return console.error("No bot name provided");
    }
    let url = joinAbsoluteUrlPath(
      pm4botsEndpointInput,
      "bot",
      botName,
      "llm",
      "dfg-improvements"
    );
    url += "?event-log-url=" + eventLogEndpointInput;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "openai-key": this.openaiToken,
      }),
    });
    const result = await response.text();
    document.querySelector("#chatgptRes").innerHTML = result;
    this.loading = false;
    this.chatGPTRes = true;
    document.querySelector("#askGPTButton").disabled = false;
  }
}

customElements.define("bot-improvements", ImprovementRec);

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
