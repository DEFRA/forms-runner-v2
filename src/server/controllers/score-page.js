import scoreResponse from '~/src/server/controllers/mock-score-response.js'
import { findPage } from '~/src/server/plugins/engine/helpers.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class ScorePageController extends QuestionPageController {
  viewName = 'grants/score-results'

  getScoreChance(scoreBand) {
    switch (scoreBand) {
      case 'Strong':
        return 'seems likely to'
      case 'Average':
        return 'might'
      default:
        return 'seems unlikely to'
    }
  }

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
      viewModel.scoreChance = this.getScoreChance(scoreResponse.scoreBand)
      viewModel.scoreBand = scoreResponse.scoreBand

      const questions = scoreResponse.questions.map((question) => ({
        category: question.category,
        answers: question.answers,
        scoreBand: question.score.band,
        fundingPriorities: question.fundingPriorities,
        title: findPage(this.model, question.questionId).title
      }))

      viewModel.questions = questions
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
