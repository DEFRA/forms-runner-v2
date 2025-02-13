import { type DetailsComponent } from '@defra/forms-model'

import { ComponentBase } from '~/src/server/plugins/engine/components/ComponentBase.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'

export class Details extends ComponentBase {
  declare options: DetailsComponent['options']
  content: DetailsComponent['content']

  constructor(
    def: DetailsComponent,
    props: ConstructorParameters<typeof ComponentBase>[1]
  ) {
    super(def, props)

    const { content, options } = def

    this.content = content
    this.options = options
  }

  getViewModel(_context: FormContext) {
    const { content, title, viewModel } = this

    return {
      ...viewModel,
      html: content,
      summaryHtml: title
    }
  }
}
