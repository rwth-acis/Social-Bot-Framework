import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import { LitElement, html, css } from "lit";
import "./bot.widget.js";
import "@rwth-acis/syncmeta-widgets";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = {
    loading: { type: Boolean, value: true },
  };

  // firstUpdated() {
  //   // Common.setSpace("bot-modeling");
  //   // this.setInitialIframeDimensions();
  //   // const modelOpsContainer = document.getElementById("modelOpsContainer");
  //   // const maincontainer = document.getElementById("maincontainer");
  //   // const resizeObserver = new ResizeObserver((entries) => {
  //   //   entries.forEach((entry) => {
  //   //     if (this.init >= 2) {
  //   //       const dimensions = entry.contentRect;
  //   //       localStorage.setItem(
  //   //         entry.target.id,
  //   //         JSON.stringify({
  //   //           width: dimensions.width,
  //   //           height: dimensions.height,
  //   //         })
  //   //       );
  //   //     } else {
  //   //       this.init++;
  //   //     }
  //   //   });
  //   // });
  //   // resizeObserver.observe(modelOpsContainer);
  //   // resizeObserver.observe(maincontainer);
  // }
  /**
   * sets the initial dimensions of the widget containers based on the last dimensions set by the user
   */
  // setInitialIframeDimensions() {
  //   const modelOpsContainer = document.getElementById("modelOpsContainer");
  //   const maincontainer = document.getElementById("maincontainer");
  //   let containerDimensions = localStorage.getItem("modelOpsContainer");
  //   if (containerDimensions) {
  //     const { width, height } = JSON.parse(containerDimensions);
  //     modelOpsContainer.style.width = width;
  //     modelOpsContainer.style.height = height;
  //   }
  //   containerDimensions = localStorage.getItem("maincontainer");
  //   if (containerDimensions) {
  //     const { width, height } = JSON.parse(containerDimensions);
  //     maincontainer.style.width = width;
  //     maincontainer.style.height = height;
  //   }
  // }

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    return html` <style>
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
      <div
        class="container-fluid  card card-body shadow-sm mb-4"
        id="modelOpsContainer"
      >
        <bot-widget></bot-widget>
      </div>
      <widget-container></widget-container>`;
  }
}

window.customElements.define("bot-modeling", BotModeling);
