import { YesNoField } from '~/src/server/plugins/engine/components/YesNoField.js'

describe('YesNoField', () => {
  describe('Generated schema', () => {
    const componentDefinition = {
      subType: 'field',
      type: 'YesNoField',
      name: 'speakEnglish',
      title: 'Speak English?',
      options: {},
      schema: {}
    }

    const formModel = {
      makePage: () => jest.fn(),
      getList: () => ({
        name: '__yesNo',
        title: 'Yes/No',
        type: 'boolean',
        items: [
          {
            text: 'Yes',
            value: true
          },
          {
            text: 'No',
            value: false
          }
        ]
      })
    }

    describe('getViewModel', () => {
      it('viewModel item Yes is checked when evaluating boolean true', () => {
        const component = new YesNoField(componentDefinition, formModel)
        const formData = {
          speakEnglish: true
        }

        const viewModel = component.getViewModel(formData)
        const yesItem = viewModel.items.filter((item) => item.text === 'Yes')[0]

        expect(yesItem).toEqual({
          text: 'Yes',
          value: true,
          checked: true
        })
      })

      it("viewModel item Yes is checked when evaluating string 'true'", () => {
        const component = new YesNoField(componentDefinition, formModel)
        const formData = {
          speakEnglish: 'true'
        }

        const viewModel = component.getViewModel(formData)
        const yesItem = viewModel.items.filter((item) => item.text === 'Yes')[0]

        expect(yesItem).toEqual({
          text: 'Yes',
          value: true,
          checked: true
        })
      })

      it('viewModel item No is checked when evaluating boolean false', () => {
        const component = new YesNoField(componentDefinition, formModel)
        const formData = {
          speakEnglish: false
        }

        const viewModel = component.getViewModel(formData)
        const noItem = viewModel.items.filter((item) => item.text === 'No')[0]

        expect(noItem).toEqual({
          text: 'No',
          value: false,
          checked: true
        })
      })

      it("viewModel item No is checked when evaluating string 'false'", () => {
        const component = new YesNoField(componentDefinition, formModel)
        const formData = {
          speakEnglish: 'false'
        }

        const viewModel = component.getViewModel(formData)
        const noItem = viewModel.items.filter((item) => item.text === 'No')[0]

        expect(noItem).toEqual({
          text: 'No',
          value: false,
          checked: true
        })
      })
    })
  })
})
