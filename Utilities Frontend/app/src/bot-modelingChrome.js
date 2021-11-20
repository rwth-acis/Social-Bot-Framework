import { LitElement, html } from "lit-element";
import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import ModelOps from "./model-ops.js";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static get template() {
    return html`
      <div>
        <iframe id="Bot" src="{WEBHOST}/syncmeta/bot.html"> </iframe>
      </div>
      <div class="maincontainer">
        <div class="innercontainer">
          <iframe id="Canvas" src="{WEBHOST}/syncmeta/widget.html"> </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="Palette" src="{WEBHOST}/syncmeta/palette.html"> </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="Property Browser" src="{WEBHOST}/syncmeta/attribute.html">
          </iframe>
          <iframe id="Import Tool" src="{WEBHOST}/syncmeta/debug.html">
          </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="User Activity" src="{WEBHOST}/syncmeta/activity.html">
          </iframe>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
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
        padding: 5px;
        margin: 5px;
        flex: 1;
      }
      .innercontainer:nth-of-type(1) {
        flex: 4;
        display: flex;
        flex-flow: column;
      }
      /* .innercontainer:nth-of-type(2) {
      } */
      .innercontainer:nth-of-type(3) {
        flex: 2;
        display: flex;
        flex-flow: column;
        height: 100%;
      }
    `;
  }

  static get properties() {}

  connectedCallback() {
    super.connectedCallback();
    parent.caeFrames = this.shadowRoot.querySelectorAll("iframe");
    Common.setSpace("bot-modeling");
  }
}

window.customElements.define("bot-modeling", BotModeling);
