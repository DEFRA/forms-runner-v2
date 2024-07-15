import { type CheckboxesFieldComponent } from '@defra/forms-model'
import joi, { type ArraySchema } from 'joi'

import { SelectionControlField } from '~/src/server/plugins/engine/components/SelectionControlField.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import {
  type FormPayload,
  type FormSubmissionErrors,
  type FormSubmissionState
} from '~/src/server/plugins/engine/types.js'

export class CheckboxesField extends SelectionControlField {
  declare options: CheckboxesFieldComponent['options']
  declare schema: CheckboxesFieldComponent['schema']
  declare formSchema: ArraySchema<string>
  declare stateSchema: ArraySchema<string>

  constructor(def: CheckboxesFieldComponent, model: FormModel) {
    super(def, model)

    const { options, schema, title } = def

    let formSchema = joi.array<string>().single().label(title.toLowerCase())

    if (options.required === false) {
      // null or empty string is valid for optional fields
      formSchema = formSchema
        .empty(null)
        .items(joi[this.listType]().valid(...this.values, ''))
    } else {
      formSchema = formSchema
        .items(joi[this.listType]().valid(...this.values))
        .required()
    }

    this.formSchema = formSchema
    this.stateSchema = formSchema
    this.options = options
    this.schema = schema
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state[this.name]
      ?.map(
        (value) =>
          this.items.find((item) => `${item.value}` === `${value}`)?.text ?? ''
      )
      .join(', ')
  }

  getViewModel(payload: FormPayload, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(payload, errors)

    // Handle single (string) or multiple (array) values
    const payloadItems = this.name in payload ? [payload[this.name]].flat() : []

    viewModel.items = (viewModel.items ?? []).map((item) => ({
      ...item,
      checked: payloadItems.some((i) => `${item.value}` === i)
    }))

    return viewModel
  }
}
