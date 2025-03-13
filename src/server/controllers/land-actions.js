import {
  fetchActions,
  findActionById
} from '~/src/server/common/helpers/grant-application-service/grant-application-service.js'
import { findPage } from '~/src/server/plugins/engine/helpers.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class LandActionsController extends QuestionPageController {
  viewName = 'grants/select-land-actions'

  /**
   * This method is called when there is a POST request to the select land actions page.
   * It gets the land parcel id and redirects to the next step in the journey.,
   */

  makePostRouteHandler() {
    /**
     * Handle GET requests to the score page.
     * @param {FormRequest} request
     * @param {FormContext} context
     * @param {Pick<ResponseToolkit, 'redirect' | 'view'>} h
     * @returns {Promise<import('@hapi/boom').Boom<any> | import('@hapi/hapi').ResponseObject>}
     */
    const fn = async (request, context, h) => {
      const { state } = context
      const payload = request.payload ?? {}
      const { actionId } = payload
      const action = findActionById(actionId)
      await this.setState(request, {
        ...state,
        actionId,
        actionName: action.title
      })
      return this.proceed(request, h, this.getNextPath(context))
    }

    return fn
  }

  /**
   * This method is called when there is a GET request to the land grants home page.
   * It gets the view model for the page using the `getViewModel` method,
   * and then adds business details to the view model
   */
  makeGetRouteHandler() {
    /**
     * Handle GET requests to the score page.
     * @param {FormRequest} request
     * @param {FormContext} context
     * @param {Pick<ResponseToolkit, 'redirect' | 'view'>} h
     */
    const fn = (request, context, h) => {
      const { collection, viewName, model } = this
      const { params } = request
      const { state } = context

      const page = findPage(model, `/${params.path}`)
      const viewModel = {
        ...super.getViewModel(request, context),
        errors: collection.getErrors(collection.getErrors()),
        landParcelId: state.landParcelId,
        actions: fetchActions(),
        title: page?.title
      }

      return h.view(viewName, viewModel)
    }

    return fn
  }
}

/**
 * @import { type FormRequest } from '~/src/server/routes/types.js'
 * @import { type FormContext } from '~/src/server/plugins/engine/types.js'
 * @import { type ResponseToolkit } from '@hapi/hapi'
 */
