import { StatusPageController } from '~/src/server/plugins/engine/pageControllers/StatusPageController.js'

export default class ConfirmationPageController extends StatusPageController {
  getStatusPath() {
    return '/confirmation'
  }
}
