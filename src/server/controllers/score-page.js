import scoreResponse from '~/src/server/controllers/mock-score-response.js'
import { findPage } from '~/src/server/plugins/engine/helpers.js'
import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export default class ScorePageController extends QuestionPageController {
  viewName = 'grants/score-results'

  /**
   * Return a string describing the chance of success based on the
   * scoreBand.
   * @param {string} scoreBand - The score band returned by the evaluation
   * @returns {string} A string suitable for inclusion in a sentence
   * describing the chance of success.
   * @example
   * getScoreChance('strong') // 'seems likely to'
   * getScoreChance('average') // 'might'
   * getScoreChance('weak') // 'seems unlikely to'
   */
  getScoreChance(scoreBand) {
    /**
     * @type {Record<string, string>}
     */
    const scoreMapping = {
      strong: 'seems likely to',
      average: 'might'
    }

    return scoreMapping[scoreBand.toLowerCase()] || 'seems unlikely to'
  }

  /**
   * This method is called when there is a GET request to the score page.
   * It gets the view model for the page using the `getViewModel` method,
   * and then adds two properties to the view model: `scoreChance` and
   * `scoreBand`. `scoreChance` is a string that describes the chance of
   * success based on the scoreBand, and is used in a sentence in the page.
   * `scoreBand` is the score band returned by the evaluation, and is used
   * to determine whether the project is eligible or not.
   * The method then uses the `h.view` method to render the page using the
   * view name and the view model.
   */
  makeGetRouteHandler() {
    /**
     * Handle GET requests to the score page.
     * @param {FormRequest} request
     * @param {FormContext} context
     * @param {Pick<ResponseToolkit, 'redirect' | 'view'>} h
     */
    const fn = async (request, context, h) => {
      const { collection, viewName, model } = this
      const score = await Promise.resolve(scoreResponse)

      const viewModel = {
        ...super.getViewModel(request, context),
        errors: collection.getErrors(collection.getErrors()),
        scoreChance: this.getScoreChance(score.scoreBand),
        scoreBand: score.scoreBand,
        questions: score.questions.map(
          ({ category, answers, score, fundingPriorities, questionId }) => ({
            category,
            answers,
            scoreBand: score.band,
            fundingPriorities,
            title: findPage(model, questionId)?.title
          })
        )
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
