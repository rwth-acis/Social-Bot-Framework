import { LitElement, html, css } from "lit";
import { Common } from "./common.js";
import ModelOps from "./model-ops.js";
import { Router } from "@vaadin/router";
import "las2peer-frontend-statusbar/las2peer-frontend-statusbar.js";

// env:development will be replaced by vite with env:production during build process
const production = "env:development" === "env:production";
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
      value: "",
    },
    alertType: {
      type: String,
      value: "",
    },
    router: {},
  };

  constructor() {
    super();
  }
  render() {
    return html`
      <style>
        header {
          flex: 0 1 auto;
        }
        section .content {
          flex: 1 1 auto;
        }
        #main {
          height: 100%;
        }
      </style>
      <div id="main">
        <header>
          <las2peer-frontend-statusbar
            id="statusBar"
            service="Social Bot Framework"
            ?autoappendwidget="${this.autoAppendWidget}"
          >
            <div slot="left">
              <a href="/">
                <img src="/sbf-logo-head.svg" class="logo" id="sbf-logo"
              /></a>
            </div>
          </las2peer-frontend-statusbar>

          <nav
            class="navbar navbar-light bg-light mb-2 p-0 justify-content-start"
          >
            <ul class="ms-4 list-group list-group-horizontal navbar-nav me-2">
              <li class="nav-item me-4">
                <a class="nav-link d-flex flex-row bd-highlight" href="/">
                  <div class="py-2 bd-highlight">
                    <i class="bi bi-house"></i>
                  </div>
                  <div class="p-2 bd-highlight">Home</div>
                </a>
              </li>
              <li class="nav-item me-4">
                <a
                  class="nav-link d-flex flex-row bd-highlight"
                  data-bs-toggle="tab"
                  data-bs-target="#bot-modeling"
                  type="button"
                  role="tab"
                  aria-controls="bot-modeling"
                  @click="${()=>this.goToModeling('bot-modeling')}"
                >
                  <div class="py-2 bd-highlight">
                    <i class="bi bi-robot"></i>
                  </div>
                  <div class="p-2 bd-highlight">Bot Modeling</div>
                </a>
              </li>

              <li class="nav-item">
                <a
                  data-bs-toggle="tab"
                  data-bs-target="#nlu-training"
                  type="button"
                  role="tab"
                  aria-controls="nlu-training"
                  class="nav-link d-flex flex-row bd-highlight"
                  @click="${()=>this.goToModeling('nlu-training')}"
                >
                  <div class="py-2 bd-highlight">
                    <i class="bi bi-book"></i>
                  </div>
                  <div class="p-2 bd-highlight">NLU Model Training Helper</div>
                </a>
              </li>
            </ul>

            <form class="d-flex ms-auto" id="spaceForm">
              <div class="d-flex flex-row">
                <div class="me-2 align-self-center">
                  <label for="yjsRoomInput">Change Space</label>
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
        </header>
        <section class="content">
          <div class="container">${this.alertTemplate()}</div>
          <div id="outlet" class="m-2"></div>
        </section>
      </div>
    `;
  }

  static get observers() {}

  firstUpdated() {
    super.firstUpdated();
    const statusBar = document.querySelector("#statusBar");

    if (production) {
      statusBar.setAttribute("baseUrl", "{CONTACT_SERVICE_URL}");
      statusBar.setAttribute("subtitle", "{STATUSBAR_SUBTITLE}");
      statusBar.setAttribute("oidcclientid", "{OIDC_CLIENT_ID}");
    } else {
      statusBar.setAttribute("baseUrl", "http://localhost:8080");
      statusBar.setAttribute("subtitle", "development");
      statusBar.setAttribute("oidcclientid", "localtestclient");
    }
    statusBar.addEventListener("signed-in", (event) => this.handleLogin(event));
    statusBar.addEventListener("signed-out", (event) =>
      this.handleLogout(event)
    );
    document.querySelector("#spaceForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this._onChangeButtonClicked();
    });
    this.displayCurrentRoomName();

    const outlet = document.getElementById("outlet");
    this.router = new Router(outlet);

    this.router.setRoutes([
      {
        path: "/",
        component: "welcome-page",
        action: () => import("./welcome.js"),
      },
      {
        path: "/modeling",
        component: "main-page",
        action: () => import("./main.js"),
      },
    ]);
    // if on modeling route, upload meta model
    if (window.location.pathname === "/modeling") {
      ModelOps.uploadMetaModel().then(async (confirmation) => {
        if (confirmation) {
          location.reload();
        }
      });
    }
  }

  _onChangeButtonClicked() {
    const input = document.querySelector("#yjsRoomInput").value;
    const currentRoomName = Common.getYjsRoomName();
    if (!input || input.trim().length === 0) {
      alert("Please enter a valid room name");
      return;
    }
    if (input === currentRoomName) {
      alert("You are already in this space!");
      return;
    }
    Common.setYjsRoomName(input);
    Common.setSpace("space");
    this.changeVisibility("#roomEnterLoader", true);
    location.reload();
  }

  /**
   * This function is called whenever the user wants to navigate either to the bot modeling or the nlu training page, from a different page.
   */
  goToModeling(subRoute) {
    const currentPath = window.location.pathname;
    if (currentPath === "/") {
      Router.go(`modeling#${subRoute}`);
    }
  }

  displayCurrentRoomName() {
    let spaceName = Common.getYjsRoomName();
    if (spaceName) {
      document.querySelector("#yjsRoomInput").value = spaceName;
    } else {
      this.alertMessage =
        "No space selected. Please select a space in the top right corner of the navigation bar.";
    }
  }

  changeVisibility(htmlQuery, show) {
    var item = document.querySelector(htmlQuery);
    if (show) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  }

  handleLogin(event) {
    localStorage.setItem("access_token", event.detail.access_token);
    localStorage.setItem(
      "userinfo_endpoint",
      "https://auth.las2peer.org/auth/realms/main/protocol/openid-connect/userinfo"
    );
    const userInfo = {
      sub: event.detail.profile.sub,
      email: event.detail.profile.email,
      preferred_username: event.detail.profile.preferred_username,
      loginName: event.detail.profile.preferred_username,
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
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
        class="alert alert-${this.alertType} fade show"
        role="alert"
        id="alert"
      >
        ${this.alertMessage}
        <!-- <button
          @click="${this.closeAlert}"
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button> -->
      </div>
    `;
  }

  closeAlert() {
    this.alertMessage = "";
  }

  refreshIframes() {}

  createRenderRoot() {
    return this;
  }
}

window.customElements.define("static-app", StaticApp);
