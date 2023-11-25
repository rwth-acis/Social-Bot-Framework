import vls from "../assets/SyncMeta Models/vls.json";
import config from "../config.json";
import { getInstance } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync.js";
import { Common } from "./common.js";
import GenerateViewpointModel from "./lib/generateVLS.js";
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
      spaceTitle: Common.getYjsRoom(),
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
          resolve(false);
        } else {
          // ask user whether to upload the default metamodel
          const confirmed = confirm(
            "You are currently working on the metamodel. Do you want to switch to bot modeling?"
          );
          if (confirmed) {
            y.getMap("data").set("metamodel", GenerateViewpointModel(vls, y));

            resolve(true);
          } else {
            resolve(false);
          }
        }
      }, 5000);
    });
  }

  async getModel() {
    const y = await this.getY(true);
    return y.getMap("data").get("model");
  }

  async observeTraininingData(cb) {
    const y = await this.getY(true);
    y.getText("training").observe((e) => cb(e.value));
  }
}

const instance = new ModelOps();
export default instance;
