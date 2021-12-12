import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import { LitElement, html, css } from "lit";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = {};

  static styles = css`
    #yjsroomcontainer {
      display: flex;
      margin: 5px;
      flex: 1;
      align-items: center;
    }
    .loader {
      border: 5px solid #f3f3f3; /* Light grey */
      border-top: 5px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 2s linear infinite;
      display: none;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    iframe {
      width: 100%;
      height: 100%;
    }

    .maincontainer {
      min-height: 55vh;
      resize: both;
      overflow: auto;
    }
    .col {
      padding: 0;
    }
    .maincontainer > .row {
      height: inherit;
      min-height: inherit;
    }

    .innercontainer {
      margin: 5px;
      flex: 1;
    }
    .innercontainer:nth-of-type(1) {
      flex: 4;
      display: flex;
      flex-flow: column;
    }

    .innercontainer:nth-of-type(3) {
      flex: 2;
      display: flex;
      flex-flow: column;
      height: 100%;
    }
    #modelOpsContainer {
      resize: vertical;
      overflow: auto;
    }
  `;
  constructor() {
    super();
  }
  static init = 0;
  render() {
    return html`
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
          crossorigin="anonymous"
        ></script>
      </head>
      <div
        class="container-fluid card card-body shadow-sm mb-4"
        id="modelOpsContainer"
      >
        <iframe
          id="Bot"
          src="{SYNC_META_HOST}/syncmeta/bot.html"
          frameborder="0"
        >
        </iframe>
      </div>
      <div
        class="container-fluid maincontainer  card  border-2 shadow"
        id="maincontainer"
      >
        <div class="row flex-wrap">
          <div class="col col-md-6">
            <iframe
              id="Canvas"
              src="{SYNC_META_HOST}/syncmeta/widget.html"
              frameborder="0"
            >
            </iframe>
          </div>
          <div class="col col-md-2 border-end">
            <iframe
              id="Palette"
              src="{SYNC_META_HOST}/syncmeta/palette.html"
              frameborder="0"
            >
            </iframe>
          </div>
          <div class="col col-md-3 border-end">
            <div class="h-100 d-flex flex-column flex-fill">
              <iframe
                id="Property Browser"
                src="{SYNC_META_HOST}/syncmeta/attribute.html"
                frameborder="0"
                style="height: 50%"
              >
              </iframe>
              <iframe
                id="Import Tool"
                src="{SYNC_META_HOST}/syncmeta/debug.html"
                frameborder="0"
              >
              </iframe>
            </div>
          </div>
          <div class="col col-md-1">
            <iframe
              id="User Activity"
              src="{SYNC_META_HOST}/syncmeta/activity.html"
              frameborder="0"
            >
            </iframe>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    this.setInitialIframeDimensions();
    const modelOpsContainer =
      this.shadowRoot.getElementById("modelOpsContainer");
    const maincontainer = this.shadowRoot.getElementById("maincontainer");

    parent.caeFrames = this.shadowRoot.querySelectorAll("iframe");

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (this.init >= 2) {
          const dimensions = entry.contentRect;

          localStorage.setItem(
            entry.target.id,
            JSON.stringify({
              width: dimensions.width,
              height: dimensions.height,
            })
          );
        } else {
          this.init++;
        }
      });
    });

    resizeObserver.observe(modelOpsContainer);
    resizeObserver.observe(maincontainer);

    Common.setSpace("bot-modeling");
  }
  /**
   * sets the initial dimensions of the widget containers based on the last dimensions set by the user
   */
  setInitialIframeDimensions() {
    const modelOpsContainer =
      this.shadowRoot.getElementById("modelOpsContainer");
    const maincontainer = this.shadowRoot.getElementById("maincontainer");
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
}

window.customElements.define("bot-modeling", BotModeling);
