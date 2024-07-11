import { type List, type YesNoFieldComponent } from '@defra/forms-model'

import { ListFormComponent } from '~/src/server/plugins/engine/components/ListFormComponent.js'
import {
  addClassOptionIfNone,
  buildFormSchema,
  buildStateSchema
} from '~/src/server/plugins/engine/components/helpers.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import {
  type FormPayload,
  type FormSubmissionErrors,
  type FormSubmissionState
} from '~/src/server/plugins/engine/types.js'

/**
 * @description
 * YesNoField is a radiosField with predefined values.
 */
export class YesNoField extends ListFormComponent {
  options: YesNoFieldComponent['options']
  schema: YesNoFieldComponent['schema']

  list?: List = {
    name: '__yesNo',
    title: 'Yes/No',
    type: 'boolean',
    items: [
      {
        text: 'Yes',
        value: true
      },
      {
        text: 'No',
        value: false
      }
    ]
  }

  get items() {
    return this.list?.items ?? []
  }

  get values() {
    return [true, false]
  }

  constructor(def: YesNoFieldComponent, model: FormModel) {
    super(def, model)

    const { options, schema } = def

    this.options = options
    this.schema = schema

    this.formSchema = buildFormSchema(
      'boolean',
      this,
      options.required !== false
    ).valid(true, false)

    this.stateSchema = buildStateSchema(this.list?.type, this).valid(
      true,
      false
    )

    addClassOptionIfNone(options, 'govuk-radios--inline')
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const value = state[this.name]
    const item = this.items.find((item) => item.value === value)
    return item?.text ?? ''
  }

  getViewModel(payload: FormPayload, errors?: FormSubmissionErrors) {
    const { name } = this

    const viewModel = super.getViewModel(payload, errors)
    let { fieldset, items, label } = viewModel

    fieldset ??= {
      legend: {
        text: label.text,
        classes: 'govuk-fieldset__legend--m'
      }
    }

    items = items?.map(({ text, value }) => ({
      text,
      value,
      checked: `${value}` === `${payload[name]}`
    }))

    return {
      ...viewModel,
      fieldset,
      items
    }
  }
}
