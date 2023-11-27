import { LitElement, html, css } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import "./recommender/general-improvements.js";
import "./recommender/intent-improvements.js";
import "./recommender/custom-improvements.js";
class ImprovementRec extends LitElement {
  static styles = css``;

  createRenderRoot() {
    return this;
  }

  static properties = {
    loading: { type: Boolean, state: true, value: false },
    chatGPTRes: { type: String, state: true, value: false },
    openaiToken: {
      type: String,
      state: true,
      value: null,
    },
  };

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
      <br />
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
          <select class="form-select mb-3" aria-label="GPT model selection">
            <option selected value="gpt-3.5-turbo-1106">GPT 3.5</option>
            <option value="gpt-4-1106-preview">GPT 4</option>
          </select>
          <button type="submit" class="btn btn-primary">
            Set <i class="bi bi-check ms-1"></i>
          </button>
          <button
            type="button"
            @click="${() => {
              localStorage.removeItem("openai-token");
              this.updateToken(null);
              document.querySelector("#openai-token").value = "";
            }}"
            class="btn btn-danger"
          >
            Remove <i class="bi bi-trash ms-1"></i>
          </button>
        </form>
      </div>
      <br />

      <ul
        class="nav nav-tabs"
        id="myTab"
        role="tablist"
        ?hidden="${!this.openaiToken}"
      >
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="home-tab"
            data-bs-toggle="tab"
            data-bs-target="#home-tab-pane"
            type="button"
            role="tab"
            aria-controls="home-tab-pane"
            aria-selected="true"
          >
            General
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#profile-tab-pane"
            type="button"
            role="tab"
            aria-controls="profile-tab-pane"
            aria-selected="false"
          >
            Precision
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#custom-tab-pane"
            type="button"
            role="tab"
            aria-controls="custom-tab-pane"
            aria-selected="false"
          >
            Custom
          </button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent" ?hidden="${!this.openaiToken}">
        <div
          class="tab-pane fade show active"
          id="home-tab-pane"
          role="tabpanel"
          aria-labelledby="home-tab"
          tabindex="0"
        >
          <general-improvements
            openaiToken="${this.openaiToken}"
          ></general-improvements>
        </div>
        <div
          class="tab-pane fade"
          id="profile-tab-pane"
          role="tabpanel"
          aria-labelledby="profile-tab"
          tabindex="0"
        >
          <intent-improvements
            openaiToken="${this.openaiToken}"
          ></intent-improvements>
        </div>

        <div
          class="tab-pane fade"
          id="custom-tab-pane"
          role="tabpanel"
          aria-labelledby="custom-tab"
          tabindex="0"
        >
          <custom-improvements
            openaiToken="${this.openaiToken}"
          ></custom-improvements>
        </div>
      </div>
      <i class="bi bi-info-circle"></i> Please note that loading the results may
      take a while...
    `;
  }

  onSubmit(e) {
    e.preventDefault();
    if (e.target[1].checked) {
      localStorage.setItem("openai-token", e.target[0].value);
    }
    this.updateToken(e.target[0].value);
    const model = e.target[2].value;
    if (model) {
      localStorage.setItem("openai-model", model);
    }
  }

  updateToken(value) {
    if (!value) return;  
    this.openaiToken = value;
    this.querySelectorAll("general-improvements").forEach((child) => {
      child.openaiToken = value;
    });
    this.querySelectorAll("intent-improvements").forEach((child) => {
      child.openaiToken = value;
    });
    this.querySelectorAll("custom-improvements").forEach((child) => {
      child.openaiToken = value;
    });
  }

  async firstUpdated() {
    let token = localStorage.getItem("openai-token");
    if (!token) {
      token = config["openai-default-token"];
    }
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
        "openai-key": "evaluation-lakhoune",
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
