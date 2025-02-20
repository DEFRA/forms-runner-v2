import { ComponentType, type DetailsComponent } from '@defra/forms-model'

import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { type Guidance } from '~/src/server/plugins/engine/components/types.js'
import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import {
  type FormContext,
  type FormContextRequest
} from '~/src/server/plugins/engine/types.js'
import definition from '~/test/form/definitions/basic.js'

describe('Details', () => {
  let model: FormModel
  let formContext: FormContext

  beforeEach(() => {
    model = new FormModel(definition, {
      basePath: 'test'
    })

    const pageUrl = new URL('/test/page', 'http://example.com')
    const request: FormContextRequest = {
      method: 'get',
      url: pageUrl,
      path: pageUrl.pathname,
      params: {
        path: 'licence',
        slug: 'test'
      },
      query: {},
      app: { model }
    }

    formContext = model.getFormContext(request, {})
  })

  describe('Defaults', () => {
    let def: DetailsComponent
    let collection: ComponentCollection
    let guidance: Guidance

    beforeEach(() => {
      def = {
        title: 'Details guidance',
        name: 'myComponent',
        type: ComponentType.Details,
        content: 'Lorem ipsum dolor sit amet',
        options: {}
      } satisfies DetailsComponent

      collection = new ComponentCollection([def], { model })
      guidance = collection.guidance[0]
    })

    describe('View model', () => {
      it('sets Nunjucks component defaults', () => {
        const viewModel = guidance.getViewModel(formContext)

        expect(viewModel).toEqual(
          expect.objectContaining({
            attributes: {},
            html: def.content,
            summaryHtml: def.title
          })
        )
      })
    })
  })
})
