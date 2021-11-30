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
        observer: "_pageChanged",
      },
      autoAppendWidget: {
        type: Boolean,
        value: true,
      },
      alert: {},
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
    this.alert = html`
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        TEST
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    `;
  }
  render() {
    return html`
      <head>
        <!-- Bootstrap core CSS -->
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css"
        />
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
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css"
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

      <nav class="navbar navbar-light bg-primary">
        <ul class="list-group list-group-horizontal navbar-nav mr-auto ">
          <li class="nav-item me-4">
            <a
              class="nav-link d-flex flex-row bd-highlight "
              href="/bot-modeling"
            >
              <div class="p-2 bd-highlight">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-robot"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"
                  />
                  <path
                    d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-book"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"
                  />
                </svg>
              </div>
              <div class="p-2 bd-highlight">NLU Model Training Helper</div>
            </a>
          </li>
        </ul>
      </nav>

      <div >
        <div class="container" >
          ${this.alert}
        </div>
        
        <h2 id="currentRoom">Current Space: Test</h2>
        <form id="spaceForm">
          <div class="mb-3" id="yjsroomcontainer">
            <label for="yjsroom">Space</label>
            <input
              id="yjsRoomInput"
              class="form-control"
              type="text"
              placeholder="Enter Space name"
            />
          </div>
          <button type="submit" class="btn btn-outline-primary">ENTER</button>
        </form>
        <div class="loader" id="roomEnterLoader"></div>
      </div>

      <app-location route="{{route}}"></app-location>
      <app-route
        route="{{route}}"
        pattern="/:page"
        data="{{routeData}}"
        tail="{{subroute}}"
      ></app-route>
      <iron-pages
        selected="[[page]]"
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
    this.page = page || "sbf";
  }

 




  /* this pagechanged triggers for simple onserver written in page properties written above */
  _pageChanged(currentPage, oldPage) {
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

  _onChangeButtonClicked() {
    var roomName = this.shadowRoot.querySelector("#yjsRoomInput").value;
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
      spaceHTML = `<span style="font-weight: bold;">Current Space:</span> ${Common.getYjsRoomName()}`;
    } else {
      spaceHTML = "Please enter a space!";
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
}

window.customElements.define("static-app", StaticApp);
