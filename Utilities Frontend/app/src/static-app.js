import { LitElement, html, css } from "lit";
import "las2peer-frontend-statusbar/las2peer-frontend-statusbar.js";
import "@polymer/app-route/app-location.js";
import "@polymer/app-route/app-route.js";
import "@polymer/iron-pages/iron-pages.js";
import Common from "./common.js";
import ModelOps from "./model-ops.js";

/**
 * @customElement
 */
class StaticApp extends LitElement {
  static properties() {
    return {
      prop1: {
        type: String,
        value: "static-app",
      },
      page: {
        type: String,
        value: "sbf",
        hasChanged(newVal, oldVal) {
          alert("page has changed");
          this._pageChanged(newVal, oldVal);
        },
      },
      route:{value:""},
      routeData:{value:{}},
      subroute:{value:""},
      autoAppendWidget: {
        type: Boolean,
        value: true,
      },
      alertMessage: {
        type: String,
      },
    };
  }

  static styles = css`
    :root {
      --statusbar-background: #808080;
    }
    :host {
      display: block;
    }

    #modeluploader {
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
    #yjsRoomInput {
      max-width: 300px;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    paper-input {
      max-width: 300px;
    }
    paper-button {
      color: rgb(240, 248, 255);
      background: rgb(30, 144, 255);
      max-height: 30px;
    }
    paper-button:hover {
      color: rgb(240, 248, 255);
      background: rgb(65, 105, 225);
    }
  `;
  constructor() {
    super();
    this.alertMessage = "Test. HI";
  }
  render() {
    return html`
      <head>
        <!-- Bootstrap core CSS -->

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          crossorigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
          crossorigin="anonymous"
        ></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.1/font/bootstrap-icons.css"
        />
      </head>

      <las2peer-frontend-statusbar
        id="statusBar"
        service="Social Bot Framework"
        oidcpopupsigninurl="/src/callbacks/popup-signin-callback.html"
        oidcpopupsignouturl="/src/callbacks/popup-signout-callback.html"
        oidcsilentsigninturl="/src/callbacks/silent-callback.html"
        oidcclientid="{OIDC_CLIENT_ID}"
        subtitle="{STATUSBAR_SUBTITLE}"
        ?autoappendwidget=${this.autoAppendWidget}
      ></las2peer-frontend-statusbar>

      <nav class="navbar navbar-light bg-light mb-2 p-0">
        <ul class="list-group list-group-horizontal navbar-nav mr-auto ">
          <li class="nav-item me-4">
            <a
              class="nav-link d-flex flex-row bd-highlight "
              href="/bot-modeling"
            >
              <div class="p-2 bd-highlight">
                <i class="bi bi-robot"></i>
              </div>
              <div class="p-2 bd-highlight">Bot Modeling</div>
            </a>
          </li>

          <li class="nav-item">
            <a
              href="/model-training"
              class="nav-link d-flex flex-row bd-highlight "
            >
              <div class="p-2 bd-highlight">
                <i class="bi bi-book"></i>
              </div>
              <div class="p-2 bd-highlight">NLU Model Training Helper</div>
            </a>
          </li>
        </ul>
      </nav>

      <div class="mx-4">
        ${this.alertTemplate()}
        
        <h2>
          Current Space: <span class="text-primary" id="currentRoom">Test</span>
        </h2>
        <form id="spaceForm">
          <div class="d-flex flex-row">
            <div class="me-2">
              <label for="yjsRoomInput">Space</label>
            <input
              id="yjsRoomInput"
              class="form-control"
              type="text"
              placeholder="Enter Space name"
            />
          </div>
            <div class="mx-2 d-flex align-items-end">
              <button type="submit" class="btn btn-outline-primary">
                ENTER
              </button>
            </div>
            <div class="mx-2 d-flex align-items-end">
        <div class="loader" id="roomEnterLoader"></div>
            </div>
          </div>
        </form>
      </div>

      <app-location .route="${this.route}"></app-location>
      <app-route
        .route="${this.route}"
        pattern="/:page"
        .data="${this.routeData}"
        .tail="${this.subroute}"
      ></app-route>
      <iron-pages
        .selected="${this.page}"
        attr-for-selected="name"
        selected-attribute="visible"
        fallback-selection="404"
      >
        <bot-modeling name="bot-modeling"></bot-modeling>
        <model-training name="model-training"></model-training>
      </iron-pages>
    `;
  }

  static get observers() {
    return ["_routerChanged(routeData.page)"];
  }

  _routerChanged(page) {
    alert("_routerChanged");
    this.page = page || "sbf";
  }

  /* this pagechanged triggers for simple onserver written in page properties written above */
  _pageChanged(currentPage, oldPage) {
    alert(currentPage);
    // Opera 8.0+
    var isOpera =
      (!!window.opr && !!opr.addons) ||
      !!window.opera ||
      navigator.userAgent.indexOf(" OPR/") >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== "undefined";

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari =
      /constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(
        !window["safari"] ||
          (typeof safari !== "undefined" && safari.pushNotification)
      );

    // Internet Explor+er 6-11
    var isIE = false || !!document.documentMode;

    // Chrome 1 - 79
    var isChrome = !!window.chrome;

    switch (currentPage) {
      case "bot-modeling":
        if (isChrome || isIE || isOpera || isSafari) {
          import("./bot-modelingChrome.js").then();
          break;
        } else if (isFirefox) {
          import("./bot-modeling.js").then();
          break;
        }
        break;
      case "model-training":
        import("./model-training.js").then();
        break;
      default:
        this.page = "sbf";
    }
  }

  firstUpdated() {
    const statusBar = this.shadowRoot.querySelector("#statusBar");
    console.log("{CONTACT_SERVICE_URL}");
    console.log("{OIDC_CLIENT_ID}");
    statusBar.setAttribute("baseUrl", "{CONTACT_SERVICE_URL}");
    statusBar.addEventListener("signed-in", (event) => this.handleLogin(event));
    statusBar.addEventListener("signed-out", (event) =>
      this.handleLogout(event)
    );
    this.shadowRoot
      .querySelector("#spaceForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this._onChangeButtonClicked();
      });
    this.displayCurrentRoomName();
  }

  async _onChangeButtonClicked() {
    const roomName = this.shadowRoot.querySelector("#yjsRoomInput").value;
    Common.setYjsRoomName(roomName);
    this.changeVisibility("#roomEnterLoader", true);
    ModelOps.uploadMetaModel()
      .then(
        (_) =>
          new Promise((resolve, reject) => {
            // wait for data become active
            setTimeout((_) => resolve(), 2000);
          })
      )
      .then((_) => location.reload());
    ModelOps.uploadBotModel()
      .then(
        (_) =>
          new Promise((resolve, reject) => {
            // wait for data become active
            setTimeout((_) => resolve(), 2000);
          })
      )
      .then((_) => location.reload());
  }

  displayCurrentRoomName() {
    var spaceHTML = "";
    if (Common.getYjsRoomName()) {
      spaceHTML = Common.getYjsRoomName();
    } else {
      spaceHTML = "No Space selected. Please enter a space!";
    }
    this.shadowRoot.querySelector("#currentRoom").innerHTML = spaceHTML;
  }

  changeVisibility(htmlQuery, show) {
    var item = this.shadowRoot.querySelector(htmlQuery);
    if (show) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  }

  handleLogin(event) {
    if (localStorage.getItem("access_token") == null) {
      localStorage.setItem("access_token", event.detail.access_token);
      localStorage.setItem(
        "userinfo_endpoint",
        "https://api.learning-layers.eu/auth/realms/main/protocol/openid-connect/userinfo"
      );
      location.reload();
    }
  }

  handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userinfo_endpoint");
  }

  alertTemplate(){
    if (!this.alertMessage) {
     return ;
    }
    return html`<div class="container">
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        ${this.alertMessage}
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    </div> `;
  }
}

window.customElements.define("static-app", StaticApp);
