import { type SummaryViewModel } from '~/src/server/plugins/engine/models/index.js'
import { SummaryPageController } from '~/src/server/plugins/engine/pageControllers/SummaryPageController.js'
import {
  type FormContext,
  type FormContextRequest
} from '~/src/server/plugins/engine/types.js'

export default class DeclarationPageController extends SummaryPageController {
  constructor(model: FormModel, pageDef: PageSummary) {
    super(model, pageDef)
    this.viewName = 'grants/declaration.html'
  }

  getSummaryViewModel(
    request: FormContextRequest,
    context: FormContext
  ): SummaryViewModel {
    const viewModel = super.getSummaryViewModel(request, context)

    // Add consent checkbox
    viewModel.consentOptional = {
      value: 'CONSENT_OPTIONAL',
      text: '(Optional) I consent to being contacted by Defra or a third party about service improvements',
      checked: false,
      selected: false
    }

    return viewModel
  }
}
