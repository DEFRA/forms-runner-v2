import { type ComponentDef } from '@defra/forms-model'
import joi, {
  type CustomValidator,
  type ErrorReportCollection,
  type LanguageMessages,
  type ObjectSchema
} from 'joi'

import {
  isFormState,
  isFormValue
} from '~/src/server/plugins/engine/components/FormComponent.js'
import {
  createComponentField,
  type ComponentFieldClass,
  type FormComponentFieldClass
} from '~/src/server/plugins/engine/components/helpers.js'
import { type ComponentViewModel } from '~/src/server/plugins/engine/components/types.js'
import { getErrors } from '~/src/server/plugins/engine/helpers.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import { type PageControllerClass } from '~/src/server/plugins/engine/pageControllers/helpers.js'
import { validationOptions as opts } from '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import {
  type FormPayload,
  type FormState,
  type FormSubmissionError,
  type FormSubmissionState,
  type FormValidationResult
} from '~/src/server/plugins/engine/types.js'

export class ComponentCollection {
  page?: PageControllerClass
  parent?: ComponentFieldClass

  components: ComponentFieldClass[]
  fields: FormComponentFieldClass[]

  formSchema: ObjectSchema<FormPayload>
  stateSchema: ObjectSchema<FormSubmissionState>

  constructor(
    defs: ComponentDef[],
    props: {
      page?: PageControllerClass
      parent?: ComponentFieldClass
      model: FormModel
    },
    schema?: {
      /**
       * Defines an all-or-nothing relationship between keys where if one
       * of the peers is present, all of them are required as well
       */
      peers?: string[]

      /**
       * Defines a custom validation rule for the object schema
       */
      custom?: CustomValidator

      /**
       * Defines custom validation messages for the object schema
       */
      messages?: LanguageMessages
    }
  ) {
    const components = defs.map((def) => createComponentField(def, props))

    const fields = components.filter(
      (component): component is FormComponentFieldClass =>
        component.isFormComponent
    )

    let formSchema = joi.object<FormPayload>().required()
    let stateSchema = joi.object<FormSubmissionState>().required()

    // Add each field or concat collection
    for (const field of fields) {
      const { collection, name } = field

      formSchema = collection
        ? formSchema.concat(collection.formSchema)
        : formSchema.keys({ [name]: field.formSchema })

      stateSchema = collection
        ? stateSchema.concat(collection.stateSchema)
        : stateSchema.keys({ [name]: field.stateSchema })
    }

    if (schema?.messages) {
      formSchema = formSchema.messages(schema.messages)
    }

    // Add parent field title to collection field errors
    formSchema = formSchema.error((errors) => {
      return errors.flatMap((error) => {
        if (!isErrorContext(error.local) || error.local.title) {
          return error
        }

        // Use field key or first missing child field
        let { missing, key = missing?.[0] } = error.local

        // But avoid numeric key used by array payloads
        if (typeof key === 'number') {
          key = error.path[0]
        }

        // Find the parent field
        const parent = fields.find(
          (item) => item.name === key?.split('__').shift()
        )

        // Find the child field
        const child = (parent?.collection?.fields ?? fields).find(
          (item) => item.name === key
        )

        // Update error with child label
        if (child && (!error.local.label || error.local.label === 'value')) {
          error.local.label = child.title.toLowerCase()
        }

        // Fix error summary links for missing fields
        if (missing?.length) {
          error.path = missing
          error.local.key = missing[0]
        }

        // Update error with parent title
        error.local.title ??= parent?.title

        return error
      })
    })

    if (schema?.peers) {
      formSchema = formSchema.and(...schema.peers, {
        isPresent: isFormValue
      })
    }

    if (schema?.custom) {
      formSchema = formSchema.custom(schema.custom)
    }

    this.page = props.page
    this.parent = props.parent

    this.components = components
    this.fields = fields
    this.formSchema = formSchema
    this.stateSchema = stateSchema
  }

  get keys() {
    return this.fields.map(({ name }) => name)
  }

  getFormDataFromState(state: FormSubmissionState) {
    const payload: FormPayload = {}

    this.fields.forEach((component) => {
      Object.assign(payload, component.getFormDataFromState(state))
    })

    return payload
  }

  getFormValueFromState(state: FormSubmissionState) {
    const payload: FormPayload = {}

    // Remove name prefix for formatted value
    for (const [name, value] of Object.entries(
      this.getFormDataFromState(state)
    )) {
      const key = name.split('__').pop()
      if (!key) {
        continue
      }

      payload[key] = value
    }

    return payload
  }

  getStateFromValidForm(payload: FormPayload) {
    const state: FormState = {}

    this.fields.forEach((component) => {
      Object.assign(state, component.getStateFromValidForm(payload))
    })

    return state
  }

  getErrors(errors?: FormSubmissionError[]): FormSubmissionError[] | undefined {
    const { fields } = this

    const list: FormSubmissionError[] = []

    // Add only one error per field
    for (const field of fields) {
      const error = field.getError(errors)

      if (error) {
        list.push(error)
      }
    }

    if (!list.length) {
      return
    }

    return list
  }

  getViewModel(
    payload: FormPayload,
    errors?: FormSubmissionError[],
    conditions?: FormModel['conditions']
  ) {
    const { components } = this

    const result: ComponentViewModel[] = components.map((component) => {
      return {
        type: component.type,
        isFormComponent: component.isFormComponent,
        model: component.getViewModel(payload, errors)
      }
    })

    if (conditions) {
      return result.filter((item) =>
        item.model.condition
          ? conditions[item.model.condition]?.fn(payload)
          : true
      )
    }

    return result
  }

  /**
   * Validate form state only
   * @param value - answers via POST payload
   * @param value - answers via Redis state
   */
  validate(payload?: FormPayload): FormValidationResult<FormPayload>

  /**
   * Validate form payload only
   * @param value - answers via Redis state
   * @param schema - field name for state schema
   */
  validate(
    state: FormSubmissionState,
    schema: 'stateSchema'
  ): FormValidationResult<FormSubmissionState>

  validate(
    value: FormPayload | FormSubmissionState = {},
    schema: 'formSchema' | 'stateSchema' = 'formSchema'
  ): FormValidationResult<typeof value> {
    const result = this[schema].validate(value, opts)
    const details = result.error?.details

    return {
      value: (result.value ?? {}) as typeof value,
      errors: this.page?.getErrors(details) ?? getErrors(details)
    }
  }
}

/**
 * Check for field local state
 */
export function isErrorContext(
  value?: unknown
): value is ErrorReportCollection['local'] {
  return isFormState(value) && typeof value.label === 'string'
}
