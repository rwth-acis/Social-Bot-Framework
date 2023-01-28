import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import { LitElement, html, css } from "lit";
import "@rwth-acis/syncmeta-widgets/build/widgets/partials/main.widget";
import "@rwth-acis/syncmeta-widgets/build/widgets/partials/attribute.widget";
import "@rwth-acis/syncmeta-widgets/build/widgets/partials/debug.widget";
import "@rwth-acis/syncmeta-widgets/build/widgets/partials/palette.widget";
/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = { loading: { type: Boolean, value: true } };

  static styles = css``;
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
      <div class="container-fluid row w-100 px-0 mx-0" style="height:98vh">
        <div class="col-9 innercontainer">
          <div class="row h-100">
            <div class="col-9 px-1 border-end h-100">
              <canvas-widget></canvas-widget>
            </div>
            <div class="col-3  h-100">
              <palette-widget> </palette-widget>
            </div>
          </div>
        </div>
        <div class="col-4 innercontainer ">
          <property-browser-widget></property-browser-widget>
        </div>
        <div class="col-2 innercontainer" style="display:none">
          <user-activity-widget></user-activity-widget>
        </div>

        <div
          class="modal fade"
          id="exportModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          style="z-index: 2147483647 !important;"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <debug-widget></debug-widget>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    
    Common.setSpace("bot-modeling");
    // this.setInitialIframeDimensions();
    // const modelOpsContainer = document.getElementById("modelOpsContainer");
    // const maincontainer = document.getElementById("maincontainer");
    setTimeout(() => {
      const Iframes = document.getElementsByTagName("iframe");
      if (parent.caeFrames?.length > 0) {
        return;
      }
      if (!parent.caeFrames) {
        parent.caeFrames = [];
      }
      for (const frame of Iframes) {
        frame.id && frame.contentWindow ? parent.caeFrames.push(frame) : null;
      }
    }, 100);

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

    setTimeout(() => {
      const btnTemplate = `<button
                type="button"
                class="btn btn-secondary "
                data-bs-toggle="modal"
                data-bs-target="#exportModal"
                id="exportModel"
              >
                <i class="bi bi-cloud-fill me-1"></i>Import/Export
              </button>`;
      const rowContainer = document.querySelector(
        "#main-widget-utilities-container"
      );
      if (!rowContainer?.firstElementChild) {
        console.error(
          `Could not find the first col of row container. ${document.querySelector(
            "#main-widget-utilities-container"
          )} 
          This means that the debug widget button will not be added. 
          Make sure that the following selector is correct: #main-widget-utilities-container. The first child will be used to append the button.`
        );
        return;
      }
      rowContainer.firstElementChild?.appendChild(
        new DOMParser().parseFromString(btnTemplate, "text/html").body
          .firstChild 
      );
    }, 100);
  }
}

window.customElements.define("bot-modeling", BotModeling);
