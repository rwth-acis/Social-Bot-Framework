import { LitElement, html, css } from "lit";
import "./bot-modeling.js";
import "./model-training.js";

/**
 * @customElement
 *
 */
class MainPage extends LitElement {
  static properties = {};

  static styles = css``;
  constructor() {
    super();
  }

  render() {
    return html`
      <div class="tab-content" id="myTabContent">
        <div
          class="tab-pane fade show active"
          id="bot-modeling"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          <bot-modeling></bot-modeling>
        </div>
        <div
          class="tab-pane fade"
          id="nlu-training"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          <model-training></model-training>
        </div>
      </div>
    `;
  }

  firstUpdated() {}
  createRenderRoot() {
    return this;
  }
}

window.customElements.define("main-page", MainPage);
