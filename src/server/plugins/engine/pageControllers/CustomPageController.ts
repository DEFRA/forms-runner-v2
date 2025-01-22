import { type PageQuestion } from '@defra/forms-model'

import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'

export class CustomPageController extends QuestionPageController {
  declare pageDef: PageQuestion
  viewName = 'grants/score-results'
}
