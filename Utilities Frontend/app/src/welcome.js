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
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
      </head>
      <div class="container">
        <h2>Welcome to the Social Bot Framework</h2>
        <p>
          The Social Bot Framework is a framework for creating bots that can
          interact with the social media platform of your choice. Use the
          <a href="/bot-modeling">Bot Modeling</a> page to create a bot model
          and then use the
          <a href="/model-training">NLU Model training helper</a> to create a
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
}

window.customElements.define("welcome-page", WelcomePage);
