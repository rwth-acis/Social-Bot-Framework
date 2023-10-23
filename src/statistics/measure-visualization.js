import { LitElement, html, css } from "lit";

class MeasureVisualization extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
  `;

  static properties = {
    measure: { type: Object, state: true },
  };

  set measure(measure) {
    const oldVal = this._measure;
    this._measure = measure;
    this.requestUpdate("measure", oldVal);
  }

  get measure() {
    return this._measure;
  }

  render() {
    return html`
      <div>
        <h1>${this.measure?.name}</h1>
        <p></p>
      </div>
    `;
  }

  firstUpdated() {
    console.log(this.measure);
  }
}

customElements.define("measure-visualization", MeasureVisualization);
