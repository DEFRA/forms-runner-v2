import { PageControllerBase } from '../../../../../../src/server/plugins/engine/pageControllers/index.js'
import { FormModel } from '../../../../../../src/server/plugins/engine/models/FormModel.js'

describe('PageControllerBase', () => {
  test('getErrors correctly parses ISO string to readable string', () => {
    const def = {
      title: 'When will you get married?',
      path: '/first-page',
      name: '',
      components: [
        {
          name: 'approximate',
          options: {
            required: true,
            maxDaysInFuture: 30
          },
          type: 'DateField',
          title: 'Approximate date of marriage',
          schema: {}
        }
      ],
      next: [
        {
          path: '/second-page'
        }
      ]
    }
    const page = new PageControllerBase(
      new FormModel(
        {
          pages: [],
          startPage: '/start',
          sections: [],
          lists: [],
          conditions: []
        },
        {}
      ),
      def
    )
    const error = {
      error: {
        details: [
          {
            message:
              '"Approximate date of marriage" must be on or before 2021-12-25T00:00:00.000Z',
            path: ['approximate']
          },
          {
            message: 'something invalid',
            path: ['somethingElse']
          }
        ]
      }
    }

    expect(page.getErrors(error)).toEqual({
      titleText: 'Fix the following errors',
      errorList: [
        {
          path: 'approximate',
          href: '#approximate',
          name: 'approximate',
          text: `"Approximate date of marriage" must be on or before 25 December 2021`
        },
        {
          path: 'somethingElse',
          href: '#somethingElse',
          name: 'somethingElse',
          text: 'something invalid'
        }
      ]
    })
  })
})
