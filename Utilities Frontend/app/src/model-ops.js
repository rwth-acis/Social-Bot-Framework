import vls from './vls.js';
import Common from './common.js';
import Static from './static.js';
import botModel from './botModel.js';
import { yjsSync } from "@rwth-acis/syncmeta-widgets/src/es6/lib/yjs-sync.js";

class ModelOps {
  doccument = null;

  constructor() {
    this.getY(true);
  }

  getY(useCache) {
    if (useCache && !!this.doccument) {
      return window.y;
    }
    // return yjsSync(null, "{YJS_ADDRESS}", "ws");
    return yjsSync();

    var _this = this;
    return new Promise((resolve, reject) => {
      if (_this.y && useCache) {
        resolve(_this.y);
      } else {
        Y({
          db: {
            name: "memory", // store the shared data in memory
          },
          connector: {
            name: "websockets-client", // use the websockets connector
            room: Common.createYjsRoomNameWithSpace(Static.BotModelingSpaceId),
            options: { resource: "{YJS_RESOURCE_PATH}" },
            url: "{YJS_ADDRESS}",
          },
          share: {
            // specify the shared content
            data: "Map",
            training: "Richtext",
            rasa: "Text",
            sbfManager: "Text",
            dataName: "Text",
          },
          type: ["Text", "Map"],
          sourceDir: "/node_modules",
        }).then((y) => {
          _this.y = y;
          resolve(y);
        });
      }
    });
  }

  uploadMetaModel() {
    return this.getY(false).then((y) => {
      return new Promise((resolve, reject) => {
        // check whether there already is a metamodel or not
        if (y.share.data.get("metamodel") != null) {
          resolve();
        } else {
          console.log("Apparently empty");
          y.share.data.set("metamodel", vls);
          resolve();
        }
      });
    });
  }

  getModel() {
    return this.getY(true).then((y) => {
      return new Promise((resolve, reject) => {
        resolve(y.share.data.get("model"));
      });
    });
  }

  uploadBotModel() {
    return this.getY(false).then((y) => {
      return new Promise((resolve, reject) => {
        if (y.share.data.get("model") != null) {
          resolve(y.share.data.get("model"));
        } else {
          y.share.data.set("model", botModel);
          resolve(y.share.data.get("model"));
        }
      });
    });
  }

  observeTraininingData(cb) {
    return this.getY(true).then((y) => {
      y.share.training.observe((e) => cb(e.value));
    });
  }
}

const instance = new ModelOps();
export default instance;
