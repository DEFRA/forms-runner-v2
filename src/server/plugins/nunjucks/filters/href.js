import { getPageHref } from '~/src/server/plugins/engine/index.js'

/**
 * Nunjucks filter to get the href for a page
 * @this {import('../types.js').NunjucksContext}
 * @param {string} path
 * @returns {string}
 */
export function href(path) {
  if (typeof path !== 'string') {
    return
  }

  const { context } = this.ctx
  const page = context.pageMap.get(path)

  if (page === undefined) {
    return
  }

  return getPageHref(page)
}
