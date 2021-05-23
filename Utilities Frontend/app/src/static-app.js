import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'las2peer-frontend-statusbar/las2peer-frontend-statusbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import Common from './common.js';
import ModelOps from './model-ops.js';
import Auth from "las2peer-project-widget/util/auth";
import Common2 from "las2peer-project-widget/util/common";
/**
 * @customElement
 * @polymer
 */
class StaticApp extends PolymerElement {
  static get template() {
    return html`
      <head>
        <!-- Bootstrap core CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" crossorigin="anonymous">
      </head>
      <style>
        :root {
          --statusbar-background: #808080;
        }
        :host {
          display: block;
        }
        #yjsroomcontainer, #modeluploader {
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
      </style>

      <las2peer-frontend-statusbar
        id="statusBar"
        service="Social Bot Framework"
        oidcpopupsigninurl="/src/callbacks/popup-signin-callback.html"
        oidcpopupsignouturl="/src/callbacks/popup-signout-callback.html"
        oidcsilentsigninturl="/src/callbacks/silent-callback.html"
        oidcclientid="d8e6c0d3-fb09-49cc-9a6d-f1763d39a0a7"
        autoAppendWidget=true
      ></las2peer-frontend-statusbar>    

      <nav class="navbar navbar-expand-md navbar-dark bg-secondary">
          <div class="collapse navbar-collapse" id="navbarCollapse">
              <ul class="navbar-nav mr-auto">
                  <li class="nav-item">
                      <a class="nav-link" href="/project-management">Project Management<span class="sr-only"></span></a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="/bot-modeling">Bot Modeling<span class="sr-only"></span></a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="/model-training">NLU Model Training Helper<span class="sr-only"></span></a>
                  </li>
              </ul>
          </div>
      </nav>

      <div>
        <p id="currentRoom">Current Space: Test</p>
        <div class="loader" id="roomEnterLoader"></div> 
      </div>

      <app-location route="{{route}}"></app-location>
      <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{subroute}}"></app-route>
      <iron-pages selected="[[page]]" attr-for-selected="name" selected-attribute="visible" fallback-selection="404">
      <project-management name="project-management"></project-management>
        <bot-modeling name="bot-modeling"></bot-modeling>
        <model-training name="model-training"></model-training>
      </iron-pages>  
    `;
  }

  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'static-app'
      },
      page:{
        type: String,
        value: 'sbf',
        observer: '_pageChanged'
      }
    };
  }

  static get observers(){
	  return ['_routerChanged(routeData.page)'];
  }

  _routerChanged(page){
    this.page = page || 'sbf';
  }

  /* this pagechanged triggers for simple onserver written in page properties written above */
  _pageChanged(currentPage, oldPage){
        // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari =/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explor+er 6-11
    var isIE =  false || !!document.documentMode;

    // Chrome 1 - 79
    var isChrome = !!window.chrome;

    switch(currentPage){
      case 'bot-modeling':
        if(isChrome || isIE || isOpera || isSafari){
          import('./bot-modelingChrome.js').then()
          break;  
        } else if(isFirefox){
          import('./bot-modeling.js').then()
          break;
        }  
        break;
      case 'model-training':
        import('./model-training.js').then()
        break;
      case 'project-management':
        import('./project-management.js').then()
        break;
      default:
        this.page = 'sbf';
    }
  }
  

  ready() {
    super.ready();
    const statusBar = this.shadowRoot.querySelector("#statusBar");
    statusBar.addEventListener('signed-in', this.handleLogin);
    statusBar.addEventListener('signed-out', this.handleLogout);
    window.addEventListener('room-changed', this._changeRoom.bind(this));
    this.displayCurrentRoomName();
  }


  _changeRoom(event){
    var roomName = event.detail.name;
    Common.setYjsRoomName(roomName);
    this.changeVisibility("#roomEnterLoader", true);
    ModelOps.uploadMetaModel()
      .then(_ => new Promise((resolve, reject) => {
        // wait for data become active
        setTimeout(_ => resolve(), 2000);
      }))
      .then(_ => location.reload());
      ModelOps.uploadBotModel()
      .then(_ => new Promise((resolve, reject) => {
        // wait for data become active
        setTimeout(_ => resolve(), 2000);
      }))
      .then(_ => location.reload());
  }

  _onChangeButtonClicked() {
    var roomName = this.shadowRoot.querySelector('#yjsRoomInput').value;
    console.log(roomName);
    Common.setYjsRoomName(roomName);
 //   setTimeout(function(){ alert("Hello"); }, 4000);
    console.log(this);
    this.changeVisibility("#roomEnterLoader", true);
    console.log("Modelops");
    console.log(ModelOps);
    ModelOps.uploadMetaModel()
      .then(_ => new Promise((resolve, reject) => {
        // wait for data become active
        setTimeout(_ => resolve(), 2000);
      }))
      .then(_ => location.reload());
      ModelOps.uploadBotModel()
      .then(_ => new Promise((resolve, reject) => {
        // wait for data become active
        setTimeout(_ => resolve(), 2000);
      }))
      .then(_ => location.reload());
  }

  displayCurrentRoomName() {
    var spaceHTML = "";
    if (Common.getYjsRoomName()) {
      spaceHTML = `<span style="font-weight: bold;">Current Space:</span> ${Common.getYjsRoomName()}`;
    } else {
      spaceHTML = "Please enter a space!";
    }
    this.shadowRoot.querySelector('#currentRoom').innerHTML = spaceHTML;
  }

  changeVisibility(htmlQuery, show) {
    var item = this.shadowRoot.querySelector(htmlQuery);
    if (show) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  } 

  handleLogin(event) {
    console.log("logging in now in handlelogin");
    localStorage.setItem("access_token", event.detail.access_token);
    localStorage.setItem("userinfo_endpoint", "https://api.learning-layers.eu/o/oauth2/userinfo");
    Auth.setAuthDataToLocalStorage(event.detail.access_token);
    var url = localStorage.userinfo_endpoint + '?access_token=' + localStorage.access_token;
    console.log(url);
    fetch(url, {method: "GET"}).then(response => {
      if(response.ok) {
        return response.json();
      }
    }).then(data => {
      console.log(data.name);
     // const userInfo = Common.getUserInfo();
      //userInfo.sub = data.sub;
      Common2.storeUserInfo(data);
      //location.reload();
    });
  }

  handleLogout() {
   console.log("why are we logging out now?");
   localStorage.removeItem("access_token");
   localStorage.removeItem("userinfo_endpoint");
  }
}

window.customElements.define('static-app', StaticApp);
