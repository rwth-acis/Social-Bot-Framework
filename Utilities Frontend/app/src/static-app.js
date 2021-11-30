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

      <nav class="navbar navbar-expand-md navbar-dark bg-secondary">
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <a class="nav-link" href="/bot-modeling"
                >Bot Modeling<span class="sr-only"></span
              ></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/model-training"
                >NLU Model Training Helper<span class="sr-only"></span
              ></a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="container">
        <div id="liveAlertPlaceholder"></div>
        <button
          type="button"
          class="btn btn-primary"
          @click="${this._showAlert}"
          id="liveAlertBtn"
        >
          Show live alert
        </button>
        <h2 id="currentRoom">Current Space: Test</h2>
        <form id="spaceForm" onsubmit="_onChangeButtonClicked()">
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

  _showAlert() {
    let alertPlaceholder = document.getElementById("liveAlertPlaceholder");

    var wrapper = document.createElement("div");
    this.alert = `<div
        class="alert alert-' +
      type +
      ' alert-dismissible"
        role="alert"
      >
        ' + '<i class="bi bi-check-circle-fill"></i>' + message + '
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>`; 
  }

  if(alertTrigger) {
    alertTrigger.addEventListener("click", function () {
      alert("Nice, you triggered this alert message!", "success");
    });
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

  connectedCallback() {
    super.connectedCallback();
    const statusBar = this.shadowRoot.querySelector("#statusBar");
    console.log("{CONTACT_SERVICE_URL}");
    console.log("{OIDC_CLIENT_ID}");
    statusBar.setAttribute("baseUrl", { CONTACT_SERVICE_URL });
    statusBar.addEventListener("signed-in", (event) => this.handleLogin(event));
    statusBar.addEventListener("signed-out", (event) =>
      this.handleLogout(event)
    );
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
