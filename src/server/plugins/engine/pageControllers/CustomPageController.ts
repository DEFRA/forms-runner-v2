import { type PageQuestion } from '@defra/forms-model'
import { type ResponseObject, type ResponseToolkit } from '@hapi/hapi'

import { QuestionPageController } from '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'
import { type FormRequest } from '~/src/server/routes/types.js'

export class CustomPageController extends QuestionPageController {
  declare pageDef: PageQuestion
  viewName = 'grants/score-results'

  makeGetRouteHandler(): (
    request: FormRequest,
    context: FormContext,
    h: Pick<ResponseToolkit, 'redirect' | 'view'>
  ) => Promise<ResponseObject> {
    const score = {}

    super.makeGetRouteHandler(request, context, h)
  }
}
