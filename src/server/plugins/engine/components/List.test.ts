import { ComponentType, type ListComponent } from '@defra/forms-model'

import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { type Guidance } from '~/src/server/plugins/engine/components/types.js'
import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import {
  type FormContext,
  type FormContextRequest
} from '~/src/server/plugins/engine/types.js'
import definition from '~/test/form/definitions/basic.js'

describe('List', () => {
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
    let def: ListComponent
    let collection: ComponentCollection
    let guidance: Guidance

    beforeEach(() => {
      def = {
        title: 'List guidance',
        name: 'myComponent',
        type: ComponentType.List,
        list: 'licenceLengthDays',
        options: {}
      } satisfies ListComponent

      collection = new ComponentCollection([def], { model })
      guidance = collection.guidance[0]
    })

    describe('View model', () => {
      it('sets Nunjucks component defaults', () => {
        const viewModel = guidance.getViewModel(formContext)

        expect(viewModel).toEqual(
          expect.objectContaining({
            attributes: {},
            content: {
              title: def.title,
              text: ''
            }
          })
        )
      })
    })

    describe('List items', () => {
      it('returns list items', () => {
        expect(guidance).toHaveProperty('items', [
          {
            text: '1 day',
            value: 1,
            description:
              'Valid for 24 hours from the start time that you select'
          },
          {
            text: '8 day',
            value: 8,
            description:
              'Valid for 8 consecutive days from the start time that you select'
          },
          {
            text: '12 months',
            value: 365,
            description:
              '12-month licences are now valid for 365 days from their start date and can be purchased at any time during the year'
          }
        ])
      })
    })
  })
})
