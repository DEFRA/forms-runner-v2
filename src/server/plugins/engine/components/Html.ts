import { type HtmlComponent } from '@defra/forms-model'

import { ComponentBase } from '~/src/server/plugins/engine/components/ComponentBase.js'
import { evaluateTemplate } from '~/src/server/plugins/engine/templates.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'

export class Html extends ComponentBase {
  declare options: HtmlComponent['options']
  content: HtmlComponent['content']

  constructor(
    def: HtmlComponent,
    props: ConstructorParameters<typeof ComponentBase>[1]
  ) {
    super(def, props)

    const { content, options } = def

    this.content = content
    this.options = options
  }

  getViewModel(context: FormContext) {
    const { content, viewModel } = this

    return {
      ...viewModel,
      content: evaluateTemplate(content, context)
    }
  }
}
