import { fetchBusinessDetails } from '~/src/server/common/helpers/consolidated-view/consolidated-view.js'
import { findPage } from '~/src/server/plugins/engine/helpers.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class LandGrantsController extends QuestionPageController {
  viewName = 'grants/land-grants'

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

      const page = findPage(model, `/${params.path}`)
      const viewModel = {
        ...super.getViewModel(request, context),
        errors: collection.getErrors(collection.getErrors()),
        business,
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
