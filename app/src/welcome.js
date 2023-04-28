import { LitElement, html, css } from "lit";

/**
 * @customElement
 *
 */
class WelcomePage extends LitElement {
  static properties = {};

  static styles = css``;
  constructor() {
    super();
  }

  render() {
    return html`
      <div class="container">
        <h2>Welcome to the Social Bot Framework</h2>
        <p>
          The Social Bot Framework is a framework for creating bots that can
          interact with the social media platform of your choice. Use the
          <a href="/modeling">Bot Modeling</a> page to create a bot model
          and then use the
          NLU Model Training Helper to create a
          language model for the bot. If you need help, check out the
          <a
            href="https://github.com/rwth-acis/Social-Bot-Framework/wiki#bot-modeling-guide"
            target="_blank"
            >Bot-modeling Guide</a
          >.
        </p>
      </div>
    `;
  }

  firstUpdated() {}
  createRenderRoot() {
    return this;
  }
}

window.customElements.define("welcome-page", WelcomePage);
