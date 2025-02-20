import { Liquid } from 'liquidjs'

import { getAnswer } from '~/src/server/plugins/engine/components/helpers.js'
import {
  type Component,
  type Field
} from '~/src/server/plugins/engine/components/types.js'
import { getPageHref } from '~/src/server/plugins/engine/helpers.js'
import { type PageControllerClass } from '~/src/server/plugins/engine/pageControllers/helpers.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'
import { type FormQuery } from '~/src/server/routes/types.js'

export const engine = new Liquid({
  outputEscape: 'escape',
  jsTruthy: true,
  ownPropertyOnly: false
})

interface GlobalScope {
  context: FormContext
  pages: Map<string, PageControllerClass>
  components: Map<string, Component>
}

engine.registerFilter('evaluate', function (template?: string) {
  if (typeof template !== 'string') {
    return template
  }

  const globals = this.context.globals as GlobalScope
  const evaluated = evaluateTemplate(template, globals.context)

  return evaluated
})

engine.registerFilter('page', function (path?: string) {
  if (typeof path !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const page = globals.pages.get(path)

  return page
})

engine.registerFilter('pagedef', function (path?: string) {
  if (typeof path !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const pageDef = globals.context.pageDefMap.get(path)

  return pageDef
})

engine.registerFilter(
  'href',
  function (page?: PageControllerClass, query?: FormQuery) {
    if (page === undefined) {
      return
    }

    return getPageHref(page, query)
  }
)

engine.registerFilter('field', function (name?: string) {
  if (typeof name !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const component = globals.components.get(name)

  return component
})

engine.registerFilter('fielddef', function (name) {
  if (typeof name !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const componentDef = globals.context.componentDefMap.get(name)

  return componentDef
})

// engine.registerFilter('answer', function (name) {
//   if (typeof name !== 'string') {
//     return
//   }

//   const globals = this.context.globals as GlobalScope
//   const component = globals.components.get(name)

//   if (!component?.isFormComponent) {
//     return
//   }

//   const answer = getAnswer(component as Field, globals.context.relevantState)

//   return answer
// })

export function evaluateTemplate(
  template: string,
  context: FormContext
): string {
  const { model } = context
  const globals: GlobalScope = {
    context,
    pages: model.pageMap,
    components: model.componentMap
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return engine.parseAndRenderSync(template, context.relevantState, {
    globals
  })
}
