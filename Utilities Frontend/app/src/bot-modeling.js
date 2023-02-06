import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import { LitElement, html } from "lit";
import "./bot.widget.js";
import "@rwth-acis/syncmeta-widgets";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = { loading: { type: Boolean, value: true } };

  renderRoot() {
    return this;
  }
  constructor() {
    super();
    this.loading = true;
  }
  static init = 0;
  render() {
    return html`
      <style>
        .maincontainer {
          min-height: 55vh;
          resize: both;
          overflow: hidden;
          position: relative;
        }
        .col {
          padding: 0;
        }

        .maincontainer > .row {
          height: inherit;
          min-height: inherit;
        }

        #modelOpsContainer {
          resize: vertical;
          overflow: hidden;
          position: relative;
        }
        .resize-icon {
          position: absolute;
          right: 0;
          bottom: 0;
          z-index: 1;
        }
      </style>
<p> HI</p>
    `;
  }

  firstUpdated() {
    // Common.setSpace("bot-modeling");
    // this.setInitialIframeDimensions();
    // const modelOpsContainer = document.getElementById("modelOpsContainer");
    // const maincontainer = document.getElementById("maincontainer");
    // const resizeObserver = new ResizeObserver((entries) => {
    //   entries.forEach((entry) => {
    //     if (this.init >= 2) {
    //       const dimensions = entry.contentRect;
    //       localStorage.setItem(
    //         entry.target.id,
    //         JSON.stringify({
    //           width: dimensions.width,
    //           height: dimensions.height,
    //         })
    //       );
    //     } else {
    //       this.init++;
    //     }
    //   });
    // });
    // resizeObserver.observe(modelOpsContainer);
    // resizeObserver.observe(maincontainer);
  }
  /**
   * sets the initial dimensions of the widget containers based on the last dimensions set by the user
   */
  setInitialIframeDimensions() {
    const modelOpsContainer = document.getElementById("modelOpsContainer");
    const maincontainer = document.getElementById("maincontainer");
    let containerDimensions = localStorage.getItem("modelOpsContainer");
    if (containerDimensions) {
      const { width, height } = JSON.parse(containerDimensions);
      modelOpsContainer.style.width = width;
      modelOpsContainer.style.height = height;
    }
    containerDimensions = localStorage.getItem("maincontainer");
    if (containerDimensions) {
      const { width, height } = JSON.parse(containerDimensions);
      maincontainer.style.width = width;
      maincontainer.style.height = height;
    }
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define("bot-modeling", BotModeling);
