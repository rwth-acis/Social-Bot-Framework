import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import Common from './common.js';
import ModelOps from './model-ops.js';

/**
 * @customElement
 * @polymer
 */
class BotModeling extends PolymerElement {
  
  static get template() {
    return html`
      <style>
        #yjsroomcontainer, #modeluploader, #modelstorer, #modelloader {
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
          display:none;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        paper-input {
          max-width: 300px;    
        }
        paper-button{
          color: rgb(240,248,255);
          background: rgb(30,144,255);
          max-height: 30px;
        }
        paper-button:hover{
          color: rgb(240,248,255);
          background: rgb(65,105,225);
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
        .innercontainer:nth-of-type(2) {
            flex: 2;
            display: flex;
            flex-flow: column;
        }
      </style>

      <div>
        <p><span style="font-weight: bold;">Model Operations</span></p>
        <div id="modeluploader">
          <paper-input id="sbfManagerEndpointInput" style="width:100%;" always-float-label label="SBF Manager Endpoint" value="http://tech4comp.dbis.rwth-aachen.de:30013/SBFManager"></paper-input>
          <paper-button on-click="_onSubmitButtonClicked">Submit</paper-button>
          <big id="sendStatus" class="form-text text-muted"></big> 
        </div>
        <div id="modelstorer">
          <paper-input id="storeNameInput" style="width:100%;" always-float-label label="Bot Model Name" value=""></paper-input>
          <paper-button on-click="_onStoreButtonClicked">Store</paper-button>
          <big id="storeStatus" class="form-text text-muted"></big> 
        </div>
        <div id="modelloader">
          <paper-input id="loadNameInput" style="width:100%;" always-float-label label="Bot Model Name" value=""></paper-input>
          <paper-button on-click="_onLoadButtonClicked">Load</paper-button>
          <big id="loadStatus" class="form-text text-muted"></big> 
        </div>
      </div>

      <div class="maincontainer">
        <div class="innercontainer">
          <iframe id="Canvas" src="{WEBHOST}/syncmeta/widget.html"> </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="Property Browser" src="{WEBHOST}/syncmeta/attribute.html"> </iframe>
          <iframe id="Import Tool" src="{WEBHOST}/syncmeta/debug.html"> </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="Palette" src="{WEBHOST}/syncmeta/palette.html"> </iframe>
        </div>
        <div class="innercontainer">
          <iframe id="User Activity" src="{WEBHOST}/syncmeta/activity.html"> </iframe>
        </div>
      </div>    
    `;
  }

  static get properties() {}

  ready() {
    super.ready();
    parent.caeFrames = this.shadowRoot.querySelectorAll("iframe");
    Common.setSpace("bot-modeling");
  }

  _onSubmitButtonClicked() {
    var sendStatus = this.shadowRoot.querySelector('#sendStatus');
    var sbfManagerEndpointInput = this.shadowRoot.querySelector('#sbfManagerEndpointInput');
    $(sendStatus).text("Sending...");
    ModelOps.getModel()
      .then(model => {
        var xhr = new XMLHttpRequest();
        var endpoint = sbfManagerEndpointInput.value;
        xhr.addEventListener("load", () => { 
          $(sendStatus).text("Successfully sent.");
          this.cleanStatus();
        });
        xhr.addEventListener("error", () => {
          $(sendStatus).text("Sending failed.");
          this.cleanStatus();
        });
        xhr.open('POST', endpoint + '/bots');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(model));
      });
  }

  _onStoreButtonClicked() {
    var storeStatus = this.shadowRoot.querySelector('#storeStatus');
    var sbfManagerEndpointInput = this.shadowRoot.querySelector('#sbfManagerEndpointInput');
    var modelNameInput = this.shadowRoot.querySelector('#storeNameInput');
    $(storeStatus).text("Storing...");
    ModelOps.getModel()
      .then(model => {
        var xhr = new XMLHttpRequest();
        var endpoint = sbfManagerEndpointInput.value;
        var name = modelNameInput.value;
        xhr.addEventListener("load", () => {
          $(storeStatus).text("Successfully stored.");
          this.cleanStatus();
        })
        xhr.addEventListener("error", () => {
          $(storeStatus).text("Storing failed.");
          this.cleanStatus();
        });
        xhr.open('POST', endpoint + '/models/' + name);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(model));
      });  
  }

  _onLoadButtonClicked() {
    var loadStatus = this.shadowRoot.querySelector('#loadStatus');
    var sbfManagerEndpointInput = this.shadowRoot.querySelector('#sbfManagerEndpointInput');
    var modelNameInput = this.shadowRoot.querySelector('#loadNameInput');
    $(loadStatus).text("Loading...");
    var xhr = new XMLHttpRequest();
    var endpoint = sbfManagerEndpointInput.value;
    var name = modelNameInput.value;
    xhr.addEventListener("load", () => {
      $(loadStatus).text("Successfully loaded.");
      this.cleanStatus();
    })
    xhr.addEventListener("error", () => {
      $(loadStatus).text("Loading failed.");
      this.cleanStatus();
    });
    xhr.open('GET', endpoint + '/models/' + name);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send("");
    var model = xhr.response;
    xhr.open('POST', endpoint + '/bots');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(model));  
  }

  cleanStatus() {
    setTimeout(_ => {
      var sendStatus = this.shadowRoot.querySelector('#sendStatus')
      $(sendStatus).text("");
    }, 7000);
  }
}

window.customElements.define('bot-modeling', BotModeling);
