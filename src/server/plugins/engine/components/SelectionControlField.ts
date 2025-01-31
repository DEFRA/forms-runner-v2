import { ListFormComponent } from '~/src/server/plugins/engine/components/ListFormComponent.js'
import { type ListItem } from '~/src/server/plugins/engine/components/types.js'
import {
  type FormContext,
  type FormPayload,
  type FormSubmissionError
} from '~/src/server/plugins/engine/types.js'

/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
  getViewModel(
    context: FormContext,
    payload: FormPayload,
    errors?: FormSubmissionError[]
  ) {
    const { options } = this

    const viewModel = super.getViewModel(context, payload, errors)
    let { fieldset, items, label } = viewModel

    fieldset ??= {
      legend: {
        text: label.text,
        classes: 'govuk-fieldset__legend--m'
      }
    }

    items = items.map((item) => {
      const { selected: checked } = item
      const itemModel = { ...item, checked } satisfies ListItem

      if ('bold' in options && options.bold) {
        itemModel.label ??= {}
        itemModel.label.classes = 'govuk-label--s'
      }

      return itemModel
    })

    return {
      ...viewModel,
      fieldset,
      items
    }
  }
}
