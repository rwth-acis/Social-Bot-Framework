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
      display: flex;
      height: 600px;
      flex-flow: row wrap;
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
  `;
  constructor() {
    super();
  }

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
      <div class="card card-body shadow-sm mb-4">
        <iframe
          id="Bot"
          src="{SYNC_META_HOST}/syncmeta/bot.html"
          frameborder="0"
        >
        </iframe>
      </div>
      <div class="maincontainer">
        <div class="innercontainer">
          <iframe
            id="Canvas"
            src="{SYNC_META_HOST}/syncmeta/widget.html"
            frameborder="0"
          >
          </iframe>
        </div>
        <div class="innercontainer">
          <iframe
            id="Palette"
            src="{SYNC_META_HOST}/syncmeta/palette.html"
            frameborder="0"
          >
          </iframe>
        </div>
        <div class="innercontainer">
          <iframe
            id="Property Browser"
            src="{SYNC_META_HOST}/syncmeta/attribute.html"
            frameborder="0"
          >
          </iframe>
          <iframe
            id="Import Tool"
            src="{SYNC_META_HOST}/syncmeta/debug.html"
            frameborder="0"
          >
          </iframe>
        </div>
        <div class="innercontainer">
          <iframe
            id="User Activity"
            src="{SYNC_META_HOST}/syncmeta/activity.html"
            frameborder="0"
          >
          </iframe>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    parent.caeFrames = this.shadowRoot.querySelectorAll("iframe");
    Common.setSpace("bot-modeling");
  }
}

window.customElements.define("bot-modeling", BotModeling);
