import vls from "./vls.js";
import botModel from "./botModel.js";
import { yjsSync } from "@rwth-acis/syncmeta-widgets";
const production = "env:development" === "env:production";

class ModelOps {
  y = null;

  constructor() {
    this.getY(true).then((y) => {
      this.y = y;
    });
  }

  getY(useCache) {
    if (useCache && this.y) {
      return new Promise((resolve) => resolve(this.y));
    }
    const yjs_address = production ? "{YJS_ADDRESS}" : "localhost:1234";
    const yjs_protocol = production ? "{YJS_PROTOCOL}" : "ws";
    return yjsSync(null, yjs_address, yjs_protocol);
  }

  async uploadMetaModel() {
    const y = await this.getY(false);
    return await new Promise((resolve, reject) => {
      // check whether there already is a metamodel or not
      if (y.getMap("data").get("metamodel") != null) {
        resolve();
      } else {
        console.log("Metamodel not found. Uploading default metamodel.");
        y.getMap("data").set("metamodel", vls);
        resolve();
      }
    });
  }

  async getModel() {
    const y = await this.getY(true);
    return y.getMap("data").get("model");
  }

  async uploadBotModel() {
    const y = await this.getY(false);

    if (!y.getMap("data").get("model")) {
      y.getMap("data").set("model", botModel);
    }
    return y.getMap("data").get("model");
  }

  async observeTraininingData(cb) {
    const y = await this.getY(true);
    y.getText("training").observe((e) => cb(e.value));
  }
}

const instance = new ModelOps();
export default instance;
