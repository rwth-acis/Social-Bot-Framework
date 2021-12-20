import "@polymer/paper-button/paper-button.js";
import Common from "./common.js";
import { LitElement, html, css } from "lit";

/**
 * @customElement
 *
 */
class BotModeling extends LitElement {
  static properties = {};

  static styles = css``;
  constructor() {
    super();
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
      <div
        class="container-fluid card card-body shadow-sm mb-4"
        id="modelOpsContainer"
      >
        
        <iframe
          id="Bot"
          src="{SYNC_META_HOST}/syncmeta/bot.html"
          frameborder="0"
          onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+"px";}(this));'
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
          <div class="col col-md-2 border-end border-2">
            <iframe
              id="Palette"
              src="{SYNC_META_HOST}/syncmeta/palette.html"
              frameborder="0"
            >
            </iframe>
          </div>
          <div class="col col-md-4">
            <div class="h-100 d-flex flex-column justify-content-between px-1">
              <iframe
                id="Property Browser"
                src="{SYNC_META_HOST}/syncmeta/attribute.html"
                frameborder="0"
              >
              </iframe>
              <div class="mb-3"></div>
              <iframe
                id="Import Tool"
                src="{SYNC_META_HOST}/syncmeta/debug.html"
                frameborder="0"
                onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+"px";}(this));'
              >
              </iframe>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    // this.setInitialIframeDimensions();
    // const modelOpsContainer = document.getElementById("modelOpsContainer");
    // const maincontainer = document.getElementById("maincontainer");
    const caeFrames = document.getElementsByTagName("iframe");
    if (parent.caeFrames?.length>0) {
      return
    }
      
    
    [...caeFrames].forEach((frame) => {
     
        console.log(frame.id,frame.contentWindow);
        if (!parent.caeFrames) {
          parent.caeFrames=[]
        }
        parent.caeFrames.find((f) => f.id === frame.id) || (frame.id && frame.contentWindow)
          ? parent.caeFrames.push(frame)
          : null; // push new frames to the array
    
    });
    console.log(parent.caeFrames);

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

    Common.setSpace("bot-modeling");
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
}

window.customElements.define("bot-modeling", BotModeling);
