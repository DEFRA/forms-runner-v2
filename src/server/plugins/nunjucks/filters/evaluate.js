import { evaluateTemplate } from '~/src/server/plugins/engine/helpers.js'

/**
 * @param {string} template
 */
export function evaluate(template) {
  const { context } = this.ctx

  return evaluateTemplate(template, context)
}
