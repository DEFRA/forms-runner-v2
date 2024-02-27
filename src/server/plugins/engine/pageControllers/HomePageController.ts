import { PageController } from "./PageController";
import type { HapiRequest, HapiResponseToolkit } from "../../../types";

export class HomePageController extends PageController {
  get getRouteOptions() {
    return {
      ext: {
        onPostHandler: {
          method: (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }

  get postRouteOptions() {
    return {
      ext: {
        onPostHandler: {
          method: (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }
}
