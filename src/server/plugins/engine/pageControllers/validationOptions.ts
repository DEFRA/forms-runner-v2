import joi, { type LanguageMessages, type ValidationOptions } from 'joi'
import lowerFirst from 'lodash/lowerFirst.js'

const opts = {
  functions: {
    lowerFirst
  }
}

/**
 * see @link https://joi.dev/api/?v=17.4.2#template-syntax for template syntax
 */
export const messageTemplate = {
  required: joi.expression('Enter {{lowerFirst(#label)}}', opts),
  selectRequired: joi.expression('Select {{lowerFirst(#label)}}', opts),
  max: '{{#label}} must be {{#limit}} characters or less',
  min: '{{#label}} must be {{#limit}} characters or more',
  pattern: joi.expression('Enter a valid {{lowerFirst(#label)}}', opts),
  format: joi.expression(
    'Enter {{lowerFirst(#label)}} in the correct format',
    opts
  ),
  number: '{{#label}} must be a number',
  numberPrecision: '{{#label}} must have {{#limit}} or fewer decimal places',
  numberInteger: '{{#label}} must be a whole number',
  numberMin: '{{#label}} must be {{#limit}} or higher',
  numberMax: '{{#label}} must be {{#limit}} or lower',
  maxWords: '{{#label}} must be {{#limit}} words or fewer',

  // Nested fields use component title
  objectRequired: joi.expression('Enter {{#label}}', opts),
  objectMissing: joi.expression(
    '{{#title}} must include a {{lowerFirst(#label)}}',
    opts
  ),
  dateFormat: '{{#title}} must be a real date',
  dateMin: '{{#title}} must be the same as or after {{#limit}}',
  dateMax: '{{#title}} must be the same as or before {{#limit}}'
}

export const messages: LanguageMessages = {
  'string.base': messageTemplate.required,
  'string.min': messageTemplate.min,
  'string.empty': messageTemplate.required,
  'string.max': messageTemplate.max,
  'string.email': messageTemplate.format,
  'string.pattern.base': messageTemplate.pattern,
  'string.maxWords': messageTemplate.maxWords,

  'number.base': messageTemplate.number,
  'number.precision': messageTemplate.numberPrecision,
  'number.integer': messageTemplate.numberInteger,
  'number.unsafe': messageTemplate.format,
  'number.min': messageTemplate.numberMin,
  'number.max': messageTemplate.numberMax,

  'object.required': messageTemplate.objectRequired,
  'object.and': messageTemplate.objectMissing,

  'any.only': messageTemplate.selectRequired,
  'any.required': messageTemplate.selectRequired,
  'any.empty': messageTemplate.required,

  'date.base': messageTemplate.dateFormat,
  'date.format': messageTemplate.dateFormat,
  'date.min': messageTemplate.dateMin,
  'date.max': messageTemplate.dateMax
}

export const validationOptions: ValidationOptions = {
  abortEarly: false,
  messages,
  errors: {
    wrap: {
      array: false,
      label: false
    }
  }
}
