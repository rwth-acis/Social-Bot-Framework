import vls from "./vls.js";
import botModel from "./botModel.js";
import { yjsSync } from "@rwth-acis/syncmeta-widgets";
const production = "env:development" === "env:production";
import config from "../config.json";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync.js";
import { Common } from "./common.js";
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

    const yjsInsatnce = getInstance({
      host: config.yjs_host,
      port: config.yjs_port,
      protocol: config.yjs_socket_protocol,
      spaceTitle: Common.getYjsRoomName(),
    });
    return yjsInsatnce.connect();
  }

  async uploadMetaModel() {
    const y = await this.getY(false);
    return new Promise((resolve) => {
      setTimeout(async () => {
        // check whether there already is a metamodel or not
        const model = y.getMap("data").get("metamodel");
        if (model != null) {
          resolve();
        } else {
          // ask user whether to upload the default metamodel
          const confirmed = confirm(
            "You are currently working on the metamodel. Do you want to switch to bot modeling?"
          );
          if (confirmed) {
            y.getMap("data").set("metamodel", vls);
            await this.uploadBotModel();
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }, 1200);
    });
  }

  async getModel() {
    const y = await this.getY(true);
    return y.getMap("data").get("model");
  }

  async uploadBotModel() {
    const y = await this.getY(false);
    const model = y.getMap("data").get("model");
    if (model == null || Object.keys(model.nodes).length === 0) {
      y.getMap("data").set("model", botModel);
      return botModel;
    }
    return model;
  }

  async observeTraininingData(cb) {
    const y = await this.getY(true);
    y.getText("training").observe((e) => cb(e.value));
  }
}

const instance = new ModelOps();
export default instance;
