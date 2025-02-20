import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import {
  engine,
  evaluateTemplate
} from '~/src/server/plugins/engine/templates.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'
import templateDefinition from '~/test/form/definitions/templates.js'

describe('Helpers', () => {
  describe('evaluateTemplate', () => {
    let model: FormModel
    let formContext: FormContext

    beforeEach(() => {
      model = new FormModel(templateDefinition, {
        basePath: 'template'
      })

      formContext = {
        evaluationState: {},
        relevantState: {},
        relevantPages: [],
        payload: {},
        state: {},
        paths: [],
        isForceAccess: false,
        data: {},
        model,
        pageDefMap: model.pageDefMap,
        listDefMap: model.listDefMap,
        componentDefMap: model.componentDefMap,
        pageMap: model.pageMap,
        componentMap: model.componentMap
      }
    })

    it('should replace placeholders with values from form context relevantState', () => {
      Object.assign(formContext.relevantState, {
        WmHfSb: 'Enrique Chase'
      })

      const areYouInEngland = templateDefinition.pages[2]
      expect(areYouInEngland.title).toBe('Are you in England, {{ WmHfSb }}?')

      const result = evaluateTemplate(areYouInEngland.title, formContext)
      expect(result).toBe('Are you in England, Enrique Chase?')
    })

    it('evaluate filter should evaluate a liquid template', () => {
      Object.assign(formContext.relevantState, {
        WmHfSb: 'Enrique Chase'
      })

      const result = evaluateTemplate(
        '{{ "Hello, {{ WmHfSb }}!" | evaluate }}',
        formContext
      )

      expect(result).toBe('Hello, Enrique Chase!')
    })

    it('page filter should return the page', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'page')
      const result = evaluateTemplate(
        '{%- assign inEnglandPage = "/are-you-in-england" | page -%}{{ inEnglandPage.path }}',
        formContext
      )

      expect(filterSpy).toHaveBeenCalledWith('/are-you-in-england')
      expect(result).toBe('/are-you-in-england')
    })

    it('page filter should return empty when anything but a string is passed', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'page')

      let result = evaluateTemplate('{{ 0 | page }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(0)
      expect(result).toBe('')

      result = evaluateTemplate('{{ undefined | page }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')

      result = evaluateTemplate('{{ null | page }}', formContext)
      expect(result).toBe('')

      result = evaluateTemplate('{{ false | page }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(false)
      expect(result).toBe('')

      result = evaluateTemplate('{{ [] | page }}', formContext)
      expect(result).toBe('')
    })

    it('pagedef filter should return the page definition', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'pagedef')
      const result = evaluateTemplate(
        '{%- assign startPageDef = "/start" | pagedef -%}{{ startPageDef.title }}',
        formContext
      )

      expect(filterSpy).toHaveBeenCalledWith('/start')
      expect(result).toBe('Start page')
    })

    it('pagedef filter should return empty when anything but a string is passed', () => {
      // @ts-expect-error - spyOn type issue
      const pageFilterSpy = jest.spyOn(engine.filters, 'pagedef')

      let result = evaluateTemplate('{{ 0 | pagedef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(0)
      expect(result).toBe('')

      result = evaluateTemplate('{{ undefined | pagedef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')

      result = evaluateTemplate('{{ null | pagedef }}', formContext)
      expect(result).toBe('')

      result = evaluateTemplate('{{ false | pagedef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(false)
      expect(result).toBe('')

      result = evaluateTemplate('{{ [] | pagedef }}', formContext)
      expect(result).toBe('')
    })

    it('href filter should return the page href', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'href')
      const result = evaluateTemplate(
        '{{ "/full-name" | page | href }}',
        formContext
      )

      expect(filterSpy).toHaveBeenCalledWith(model.pageMap.get('/full-name'))
      expect(result).toBe('/template/full-name')
    })

    it('href filter should return empty when no page passed', () => {
      // @ts-expect-error - spyOn type issue
      const pageFilterSpy = jest.spyOn(engine.filters, 'href')

      const result = evaluateTemplate('{{ undefined | href }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')
    })

    it('field filter should return the component', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'field')
      const result = evaluateTemplate(
        '{%- assign inEnglandComponent = "TKsWbP" | field -%}{{ inEnglandComponent.type }}',
        formContext
      )

      expect(filterSpy).toHaveBeenCalledWith('TKsWbP')
      expect(result).toBe('YesNoField')
    })

    it('field filter should return empty when anything but a string is passed', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'field')

      let result = evaluateTemplate('{{ 0 | field }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(0)
      expect(result).toBe('')

      result = evaluateTemplate('{{ undefined | field }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')

      result = evaluateTemplate('{{ null | field }}', formContext)
      expect(result).toBe('')

      result = evaluateTemplate('{{ false | field }}', formContext)
      expect(filterSpy).toHaveBeenLastCalledWith(false)
      expect(result).toBe('')

      result = evaluateTemplate('{{ [] | field }}', formContext)
      expect(result).toBe('')
    })

    it('fielddef filter should return the component definition', () => {
      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'fielddef')
      const result = evaluateTemplate(
        '{%- assign fullNameComponentDef = "WmHfSb" | fielddef -%}{{ fullNameComponentDef.title }}',
        formContext
      )

      expect(filterSpy).toHaveBeenCalledWith('WmHfSb')
      expect(result).toBe('What&#39;s your full name?')
    })

    it('fielddef filter should return empty when anything but a string is passed', () => {
      // @ts-expect-error - spyOn type issue
      const pageFilterSpy = jest.spyOn(engine.filters, 'fielddef')

      let result = evaluateTemplate('{{ 0 | fielddef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(0)
      expect(result).toBe('')

      result = evaluateTemplate('{{ undefined | fielddef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')

      result = evaluateTemplate('{{ null | fielddef }}', formContext)
      expect(result).toBe('')

      result = evaluateTemplate('{{ false | fielddef }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(false)
      expect(result).toBe('')

      result = evaluateTemplate('{{ [] | fielddef }}', formContext)
      expect(result).toBe('')
    })

    it('answer filter should return the formatted submitted answer', () => {
      Object.assign(formContext.relevantState, {
        TKsWbP: true,
        WmHfSb: 'Enrique Chase'
      })

      // @ts-expect-error - spyOn type issue
      const filterSpy = jest.spyOn(engine.filters, 'answer')

      let result = evaluateTemplate("{{ 'TKsWbP' | answer }}", formContext)
      expect(filterSpy).toHaveBeenCalledWith('TKsWbP')
      expect(result).toBe('Yes')

      result = evaluateTemplate("{{ 'WmHfSb' | answer }}", formContext)
      expect(filterSpy).toHaveBeenCalledWith('WmHfSb')
      expect(result).toBe('Enrique Chase')
    })

    it('answer filter should return empty when anything but a string is passed', () => {
      // @ts-expect-error - spyOn type issue
      const pageFilterSpy = jest.spyOn(engine.filters, 'answer')

      let result = evaluateTemplate('{{ 0 | answer }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(0)
      expect(result).toBe('')

      result = evaluateTemplate('{{ undefined | answer }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(undefined)
      expect(result).toBe('')

      result = evaluateTemplate('{{ null | answer }}', formContext)
      expect(result).toBe('')

      result = evaluateTemplate('{{ false | answer }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith(false)
      expect(result).toBe('')

      result = evaluateTemplate('{{ [] | answer }}', formContext)
      expect(result).toBe('')
    })

    it('answer filter should return empty when non-form component name is passed', () => {
      // @ts-expect-error - spyOn type issue
      const pageFilterSpy = jest.spyOn(engine.filters, 'answer')

      const result = evaluateTemplate('{{ "FGyiLS" | answer }}', formContext)
      expect(pageFilterSpy).toHaveBeenLastCalledWith('FGyiLS')
      expect(result).toBe('')
    })
  })
})
