import { type List } from '@defra/forms-model'
import joi, { type Schema } from 'joi'

import { ListFormComponent } from '~/src/server/plugins/engine/components/ListFormComponent.js'
import * as helpers from '~/src/server/plugins/engine/components/helpers.js'
import { addClassOptionIfNone } from '~/src/server/plugins/engine/components/helpers.js'
import {
  type FormData,
  type FormSubmissionErrors,
  type FormSubmissionState
} from '~/src/server/plugins/engine/types.js'

/**
 * @description
 * YesNoField is a radiosField with predefined values.
 */
export class YesNoField extends ListFormComponent {
  list: List = {
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

  itemsSchema = joi.boolean()
  get items() {
    return this.list.items ?? []
  }

  get values() {
    return [true, false]
  }

  constructor(def, model) {
    super(def, model)

    const { options } = this

    this.formSchema = helpers
      .buildFormSchema('boolean', this, options.required !== false)
      .valid(true, false)
    this.stateSchema = helpers
      .buildStateSchema(this.list.type, this)
      .valid(true, false)

    addClassOptionIfNone(this.options, 'govuk-radios--inline')
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema }
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema }
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const value = state[this.name]
    const item = this.items.find((item) => item.value === value)
    return item?.text ?? ''
  }

  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors)

    viewModel.fieldset = {
      legend: viewModel.label
    }
    viewModel.items = this.items.map(({ text, value }) => ({
      text,
      value,
      checked: `${value}` === `${formData[this.name]}`
    }))

    return viewModel
  }
}
