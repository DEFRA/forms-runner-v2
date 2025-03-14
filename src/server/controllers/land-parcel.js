import { Boom } from '@hapi/boom'

import { fetchBusinessDetails } from '~/src/server/common/helpers/consolidated-view/consolidated-view.js'
import { findPage } from '~/src/server/plugins/engine/helpers.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class LandParcelController extends QuestionPageController {
  viewName = 'grants/select-land-parcel'

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
      const { landParcelId, hectars } = payload
      await this.setState(request, {
        ...state,
        landParcelId,
        hectars
      })
      return this.proceed(request, h, this.getNextPath(context))
    }

    return fn
  }

  /**
   * This method is called when there is a GET request to the select land parcel page.
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
    const fn = async (request, context, h) => {
      let business = null

      // TODO: This is a hardcoded value for testing purposes, should come from Defra ID
      const sbi = 117235001
      const crn = 1100598138
      const { collection, viewName, model } = this
      const { params } = request

      try {
        const result = await fetchBusinessDetails(sbi, crn)
        business = result.data?.business
      } catch (error) {
        request.logger.error(error, `Failed to fetch business details ${sbi}`)
      }

      if (!business) {
        throw Boom.notFound(`No business information found for sbi ${sbi}`)
      }

      const page = findPage(model, `/${params.path}`)
      const viewModel = {
        ...super.getViewModel(request, context),
        errors: collection.getErrors(collection.getErrors()),
        business,
        actionName: context.state.actions?.toString(),
        landParcelId: context.state.landParcelId,
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
