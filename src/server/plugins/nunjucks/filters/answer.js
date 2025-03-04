import { getAnswer } from '~/src/server/plugins/engine/components/helpers.js'

/**
 * Nunjucks filter to get the answer for a component
 * @this {NunjucksContext}
 * @param {string} name - The name of the component to check
 * @param {'data'|'email'|'summary'} format
 */
export function answer(name, format = 'summary') {
  const { context } = this.ctx

  if (!context) {
    return
  }

  const component = context.componentMap.get(name)

  if (!component?.isFormComponent) {
    return
  }

  return getAnswer(/** @type {Field} */ (component), context.relevantState, {
    format
  })
}

/**
 * @import { NunjucksContext } from '~/src/server/plugins/nunjucks/types.js'
 * @import { Field } from '~/src/server/plugins/engine/components/helpers.js'
 */
