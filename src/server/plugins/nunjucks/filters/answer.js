import { getAnswer } from '~/src/server/plugins/engine/components/helpers.js'

/**
 * Nunjucks filter to get the answer for a component
 * @this {import('../types.js').NunjucksContext}
 * @param {string} name - The name of the component to check
 * @returns {string} answer
 */
export function answer(name) {
  const { context } = this.ctx
  const component = context.componentMap.get(name)
  return getAnswer(component, context?.relevantState)
}
