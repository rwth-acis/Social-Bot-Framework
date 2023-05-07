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

  firstUpdated() {
    const routeFragment = window.location.hash;
    if (routeFragment) {
      const tab = routeFragment.split("#")[1];

      const tabElement = document.querySelector(`#${tab}`);
      if (tabElement) {
        for (const tab of document.querySelectorAll(".tab-pane")) {
          tab.classList.remove("active");
        }
        tabElement.classList.add("show", "active");
      }
    }
  }
  createRenderRoot() {
    return this;
  }
}

window.customElements.define("main-page", MainPage);
