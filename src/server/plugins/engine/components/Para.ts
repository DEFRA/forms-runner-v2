import { ComponentBase } from './ComponentBase.js'
import type { FormData, FormSubmissionErrors } from '../types.js'

export class Para extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: this.content
    }

    if (options.condition) {
      viewModel.condition = options.condition
    }
    return viewModel
  }
}
