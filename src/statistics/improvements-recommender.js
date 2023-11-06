import { LitElement, html, css } from "lit";
import config from "../../config.json";
import { Common } from "../common.js";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";

class ImprovementRec extends LitElement {
  static styles = css``;

  render() {
    return html`
      <h3>Improvements</h3>
      <form @submit="${this.onSubmit}">
        <div class="input-group mb-3">
          <input
            type="password"
            class="form-control"
            placeholder="OpenAI token"
            aria-label="token"
            aria-describedby="basic-addon1"
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
      </form>
    `;
  }

  onSubmit(e) {
    e.preventDefault();
    console.log(e);
    if (e.target[1].checked) {
      localStorage.setItem("openai-token", e.target[0].value);
    }
  }

  async firstUpdated() {
    const token = localStorage.getItem("openai-token");
    if (token) {
      this.shadowRoot.querySelector("input").value = token;
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
    }, 100);
  }
}

customElements.define("bot-improvements", ImprovementRec);
