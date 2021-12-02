import { LitElement, html, css } from "lit";

/**
 * @customElement
 *
 */
class WelcomePage extends LitElement {
  static properties() {}

  static styles = css``;
  constructor() {
    super();
  }

  render() {
    return html` <h2>Welcome to the Social Bot Framework</h2> `;
  }

  firstUpdated() {}
}

window.customElements.define("welcome-page", WelcomePage);
