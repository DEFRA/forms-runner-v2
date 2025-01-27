import scoreResponse from '~/src/server/controllers/mock-score-response.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class ScorePageController extends QuestionPageController {
  viewName = 'grants/score-results'

  makeGetRouteHandler() {
    /**
     *
     * @param {FormRequest} request
     * @param {FormContext} context
     * @param {Pick<ResponseToolkit, 'redirect' | 'view'>} h
     */
    const fn = (request, context, h) => {
      const { collection, viewName } = this
      const viewModel = super.getViewModel(request, context)

      viewModel.errors = collection.getErrors(viewModel.errors)
      viewModel.score = scoreResponse

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
