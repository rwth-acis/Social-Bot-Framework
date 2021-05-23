import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'las2peer-project-widget/project-list.js';
import Common from './common.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-tabs';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/social-icons.js';
import ModelOps from './model-ops.js';
import Auth from "las2peer-project-widget/util/auth";
/**
 * @customElement
 * @polymer
 */
class ProjectManagement extends PolymerElement {

    static get template() {
        return html`
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
       
        <!-- Bootstrap core CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" crossorigin="anonymous">
        
        <style>
            #editor {
                height: 512px;
            }
            paper-button{
              color: rgb(240,248,255);
              background: rgb(30,144,255);
              max-height: 30px;
            }
        </style>
    </head>
    <main role="main" class="container" style="margin-top: 76px">
    <h1>SBF Project Manager</h1>
            <p class="lead">With this tool, you can manage your projects and who gets to join/see them.</p>

        <div style="display: flex">
            
            <project-list system="SBF" id="project-widget" style="flex: 2"></project-list>
            <div style="flex: 2; margin-left: 1em">
                <h1>Selected project:</h1>
                <div id="notSelected"  style="display: flex; margin-left: 1em; margin-right: 1em;">
                <p style="max-width:200px">No project selected.</p>
                </div>
                <div id="projectSelected" style="display: flex; margin-left: 1em; margin-right: 1em;">
                <h3 id="project-title"></h3>
                <!-- Button for adding components to a project -->
                <paper-button id="roomChangeButton" class="paper-button-blue" on-click="enterSpace" style="margin-left: auto; margin-top: auto; margin-bottom: auto">Enter Yjs Room</paper-button>
                </div>
                <p id="selectedProject" style="max-width:200px"></p>
                <input id="metadataInput" placeholder="Random Test Metadata"></input>
                <button style="max-width: 200px">Change Meadata</button>
          </div>
        </div>
        
    </main>
    `;
    }

    static get properties() { 

        return {
            selectedProject: {
              type: Object, notify:true,observer: '_change'
            },
            selectedProjectUsers: {
              type: Array
            }
          };

    }

    ready() {
        super.ready();
        this.curModels = [];
        this.selectedProject = {"groupName":"lolololo"};
        const projectWidget = this.shadowRoot.querySelector("#project-widget");
        projectWidget.addEventListener('project-selected', this._onProjectSelected.bind(this));
        ModelOps.getY(true).then(y => console.log(y));
        this.shadowRoot.querySelector("#notSelected").style.visibility="visible";
        this.shadowRoot.querySelector("#projectSelected").style.visibility="hidden";
    }
    _change(){
        console.log("RETURN TO MONKEY");
    }

    enterSpace(event){
      console.log("event mnow");
    let newEvent = new CustomEvent("room-changed", {
      detail: {
        message: "Loaded yjs room.",
        name: this.selectedProject.name
      },
      bubbles: true
    });
    window.dispatchEvent(newEvent);
  }
    

    /**
   * For "project-selected" event of the project list.
   * @param event Event that contains the information on the selected project.
   * @private
   */
  _onProjectSelected(event) {
    console.log(this.selectedProject);
    this.selectedProject = event.detail.project;
    const project = this.shadowRoot.querySelector("#project-title");
    project.textContent = this.selectedProject.name;
    this.shadowRoot.querySelector("#notSelected").style.visibility="hidden";
    this.shadowRoot.querySelector("#projectSelected").style.visibility="visible";
    fetch("http://127.0.0.1:8080" + "/contactservice/groups/" + event.detail.project.groupName, {
      method: "GET",
      headers: Auth.getAuthHeaderWithSub()
    }).then(response => {
      if(!response.ok) throw Error(response.status);
      console.log(typeof response)
      console.log("ssssssss" + Object.keys(response));
      return response.json();
    }).then(data => {
      // store loaded groups
      // groups given by contact service as a JSONObject with key = group agent id and value = group name
      // we create an array of objects with id and name attribute out of it
      this.selectedProjectUsers = [];
      for(let key of Object.keys(data)) {
        let group = {
          "id": key,
          "name": data[key]
        };
        this.selectedProjectUsers.push(group);
      }
      console.log(this.selectedProjectUsers);
    }).catch(error => {
      console.log("Error is: " + error.message);
      if(error.message == "401") {
        // user is not authorized
        // maybe the access token has expired
        Auth.removeAuthDataFromLocalStorage();
    //    location.reload();
      } else {
        console.log(error);
        // in case of contactservice not running, which should not happen in real deployment
        this.selectedProjectUsers = [];
      }
    });
  }

    htmlQuery(query) {
        return this.shadowRoot.querySelector(query);
    }

}

window.customElements.define('project-management', ProjectManagement);
