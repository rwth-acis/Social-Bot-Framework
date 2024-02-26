import { LitElement, html, css } from "lit";
import "./bot-modeling.js";
import "./model-training.js";
import "./statistics/canvas-overlay.js";
import "./statistics/bot-statistics.js";

/**
 * @customElement
 *
 */
class MainPage extends LitElement {
  static properties = {};

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
        <div
          class="tab-pane fade"
          id="bot-statistics"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          <bot-statistics></bot-statistics>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-success rounded shadow-lg position-fixed bottom-0 end-0 m-2"
        style="display: none;"
        id="AIrecommendationButton"
        @click="${() => {
          removeBackDrop();
          this.Offcanvas.show();
        }}"
      >
        <i class="bi bi-lightbulb fs-3"></i>
      </button>

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        data-bs-backdrop="static"
        id="offCanvasChatGPT"
        aria-labelledby="offcanvasRightLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasRightLabel">
            ChatGPT Recommendations
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="${() => {
              this.Offcanvas.hide();
            }}"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <bot-improvements></bot-improvements>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    this.Offcanvas = new bootstrap.Offcanvas("#offCanvasChatGPT");
    const routeFragment = window.location.hash;
    if (routeFragment) {
      let tab = routeFragment.split("#")[1];
      if (tab.indexOf("&") >= 0) tab = tab.split("&")[0];

      const tabElement = document.querySelector(`#${tab}`);
      if (tabElement) {
        for (const tab of document.querySelectorAll(".tab-pane")) {
          tab.classList.remove("active");
        }
        tabElement.classList.add("show", "active");
      }
    }
    setTimeout(() => {
      document.querySelector("#hideType").click();
    }, 5000);
  }
  createRenderRoot() {
    return this;
  }
}

function removeBackDrop() {
  setTimeout(() => {
    const backDrop = document.querySelector(".offcanvas-backdrop");
    if (backDrop) {
      backDrop.remove();
    }
  });
}

window.customElements.define("main-page", MainPage);
