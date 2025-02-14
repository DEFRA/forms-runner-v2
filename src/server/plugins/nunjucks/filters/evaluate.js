import { evaluateTemplate } from '~/src/server/plugins/engine/helpers.js'

/**
 * @this {NunjucksContext}
 * @param {string} template
 */
export function evaluate(template) {
  const { context } = this.ctx

  if (!context) {
    return template
  }

  return evaluateTemplate(template, context)
}

/**
 * @import { NunjucksContext } from '~/src/server/plugins/nunjucks/types.js'
 */
