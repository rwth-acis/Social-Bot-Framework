import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync";
import { html, css, LitElement } from "lit-element";
import { Common } from "./common";
import config from "../config.json";

class ModelSearch extends LitElement {
  static properties = {
    searchQuery: { type: String },
    searchResults: { type: Array },
    models: { type: Object },
  };

  constructor() {
    super();
    this.searchQuery = "";
    this.searchResults = [];
    this.models = {};
  }
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    const instance = getInstance({
      spaceTitle: Common.getYjsRoom(),
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
    });
    const y = await instance.connect();
    y.getMap("bot-models").observe(async (e) => {
      this.models = e.currentTarget.toJSON();
      const filteredList = await this.getSearchResults(this.searchQuery);
      this.searchResults = filteredList
        .map((modelName) => this.models[modelName])
        .reduce((acc, curr) => [...acc, ...Object.values(curr)], []);
    });
    this.models = y.getMap("bot-models").toJSON();
    const filteredList = await this.getSearchResults(this.searchQuery);
    this.searchResults = filteredList
      .map((modelName) => this.models[modelName])
      .reduce((acc, curr) => [...acc, ...Object.values(curr)], []);
  }

  handleMoreInfoClick(e, index) {
    const popover = new bootstrap.Popover(e.target, {
      content: this.getPopoverContent(index),
      html: true,
      trigger: "manual",
    });
    popover.toggle();
  }

  async getSearchResults(query) {
    if (query.trim() === "") return Object.keys(this.models);

    const modelsNames = Object.keys(this.models);

    return modelsNames.filter((modelName) =>
      modelName.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSearchResults() {
    if (this.searchResults.length === 0) {
      return html`No models found.`;
    }

    return html`
      ${this.searchResults.map(
        (result, index) => html`
          <div id="result-${index}" class="search-result d-flex">
            ${result.name}
            ${result.versionTag
              ? html`<div class="mx-1">
                  <span class="badge pill bg-primary"
                    >${result.versionTag}</span
                  >
                </div>`
              : ""}

            <button
              class="btn btn-link btn-sm"
              data-bs-content="${this.getPopoverContent(index)}"
              @click="${(e) => this.handleMoreInfoClick(e, index)}"
              aria-expanded="false"
              tabindex="0"
              role="button"
              data-bs-trigger="focus"
            >
              <i class="bi bi-info-circle"></i>
            </button>
            <button
              class="btn btn-sm ms-auto"
              @click="${() => this.handleModelSelect(index)}"
              aria-expanded="false"
              tabindex="0"
              role="button"
              data-bs-trigger="focus"
            >
              <i class="bi bi-check-circle"></i> Select Model
            </button>
          </div>
        `
      )}
    `;
  }

  async handleSearchInput(e) {
    this.searchQuery = e.target.value;
    const filteredList = await this.getSearchResults(this.searchQuery);
    this.searchResults = filteredList
      .map((modelName) => this.models[modelName])
      .reduce((acc, curr) => [...acc, ...Object.values(curr)], []);
  }

  getPopoverContent(index) {
    const result = this.searchResults[index];
    return `
      <strong>Submitted by:</strong> ${
        result.username ? result.username : "Anonymous"
      }<br />
      <strong>Date:</strong> ${result.timestamp}
    `;
  }
  async handleModelSelect(index) {
    const result = this.searchResults[index];
    const instance = getInstance({
      spaceTitle: Common.getYjsRoom(),
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
    });
    const y = await instance.connect();
    const model = y.getMap("bot-models").get(result.name);
    y.getMap("data").set("model", model);
    alert("Model selected. The page will reload now.");
    location.reload();
  }

  render() {
    return html`
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossorigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
      />
      <script src="https://unpkg.com/@popperjs/core@2"></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossorigin="anonymous"
      ></script>
      <div class="modal-body">
        <div class="form-group">
          <div class="input-group">
            <input
              id="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search Model"
              .value="${this.searchQuery}"
              @input="${this.handleSearchInput}"
            />
            <div class="input-group-text" id="btnGroupAddon">
              <i class="bi bi-search"></i>
            </div>
          </div>
        </div>

        <div class="search-results mt-2">${this.renderSearchResults()}</div>
      </div>
    `;
  }
}

customElements.define("model-list", ModelSearch);
