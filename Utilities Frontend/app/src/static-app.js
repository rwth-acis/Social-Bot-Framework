import { LitElement, html, css } from "lit";
import "las2peer-frontend-statusbar/las2peer-frontend-statusbar.js";

import Common from "./common.js";
import ModelOps from "./model-ops.js";
import { Router } from "@vaadin/router";

import "./bot-modeling.js";
import "./model-training.js";
import "./welcome.js";
/**
 * @customElement
 */
class StaticApp extends LitElement {
  static properties = {
    prop1: {
      type: String,
      value: "static-app",
    },

    autoAppendWidget: {
      type: Boolean,
      value: true,
    },
    alertMessage: {
      type: String,
    },
    alertType: {
      type: String,
    },
  };

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
        <form class="d-flex" id="spaceForm">
          <div class="d-flex flex-row">
            <div class="me-2 align-self-center">
              <label for="yjsRoomInput">Pick Space</label>
            </div>

            <div class="me-2">
              <input
                id="yjsRoomInput"
                class="form-control me-2"
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
      </nav>

      <!-- <div class="container ">${this.alertTemplate()}</div> -->
      <h1 class="mx-4 display-5">
        Current Space: <span class="text-primary" id="currentRoom">Test</span>
      </h1>

      <div id="outlet" class="m-4"></div>
    `;
  }

  static get observers() {
  }

  firstUpdated() {
    const statusBar = this.shadowRoot.querySelector("#statusBar");
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

    const outlet = this.shadowRoot.getElementById("outlet");
    const router = new Router(outlet);

    router.setRoutes([
      { path: "/", component: "welcome-page" },
      { path: "/bot-modeling", component: "bot-modeling" },
      { path: "/model-training", component: "model-training" },
    ]);
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
  /**
   * Template for alert messages
   */
  alertTemplate() {
    if (!this.alertType) {
      this.alertType = "info";
    }
    if (!this.alertMessage) {
      return;
    }
    return html`
      <div
        class="alert alert-${this.alertType} alert-dismissible fade show"
        role="alert"
        id="alert"
      >
        ${this.alertMessage}
        <button
          @click="${this.closeAlert}"
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    `;
  }

  closeAlert() {
    this.alertMessage = "";
  }
}

window.customElements.define("static-app", StaticApp);
