import { type URLSearchParams } from 'node:url'

import {
  type FormDefinition,
  type Page,
  type RepeatingFieldPage,
  type Section
} from '@defra/forms-model'
import {
  type Request,
  type ResponseObject,
  type ResponseToolkit,
  type RouteOptions,
  type ServerRoute
} from '@hapi/hapi'
import { merge, reach } from '@hapi/hoek'
import { format, parseISO } from 'date-fns'
import { type ValidationResult, type ObjectSchema } from 'joi'

import { CheckboxesField } from '~/src/server/plugins/engine/components/CheckboxesField.js'
import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { RadiosField } from '~/src/server/plugins/engine/components/RadiosField.js'
import { type ComponentCollectionViewModel } from '~/src/server/plugins/engine/components/types.js'
import {
  decodeFeedbackContextInfo,
  FeedbackContextInfo,
  RelativeUrl
} from '~/src/server/plugins/engine/feedback/index.js'
import {
  feedbackReturnInfoKey,
  proceed,
  redirectTo
} from '~/src/server/plugins/engine/helpers.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import { type PageControllerClass } from '~/src/server/plugins/engine/pageControllers/helpers.js'
import { validationOptions } from '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import {
  type FormData,
  type FormPayload,
  type FormSubmissionErrors,
  type FormSubmissionState,
  type FormValidationResult
} from '~/src/server/plugins/engine/types.js'
import { type CacheService } from '~/src/server/services/index.js'

const FORM_SCHEMA = Symbol('FORM_SCHEMA')
const STATE_SCHEMA = Symbol('STATE_SCHEMA')

export class PageControllerBase {
  /**
   * The base class for all page controllers. Page controllers are responsible for generating the get and post route handlers when a user navigates to `/{id}/{path*}`.
   */
  def: FormDefinition
  name?: string
  model: FormModel
  pageDef: Page | RepeatingFieldPage
  path: string
  title: string
  condition?: string
  repeatField?: string
  section?: Section
  components: ComponentCollection
  hasFormComponents: boolean
  hasConditionalFormComponents: boolean
  backLinkFallback?: string

  constructor(model: FormModel, pageDef: Page | RepeatingFieldPage) {
    const { def } = model

    this.def = def
    this.name = def.name
    this.model = model
    this.pageDef = pageDef
    this.path = pageDef.path
    this.title = pageDef.title
    this.condition = pageDef.condition
    this.repeatField = pageDef.repeatField
    this.backLinkFallback = pageDef.backLinkFallback

    // Resolve section
    this.section = model.sections.find(
      (section) => section.name === pageDef.section
    )

    // Components collection
    const components = new ComponentCollection(pageDef.components, model)
    const conditionalFormComponents = components.formItems.filter(
      (c: any) => c.conditionalComponents
    )

    const fieldsForPrePopulation = components.prePopulatedItems

    if (this.section) {
      this.model.fieldsForPrePopulation[this.section.name] = {
        ...(this.model.fieldsForPrePopulation[this.section.name] ?? {}),
        ...fieldsForPrePopulation
      }
    } else {
      this.model.fieldsForPrePopulation = {
        ...this.model.fieldsForPrePopulation,
        ...fieldsForPrePopulation
      }
    }

    this.components = components
    this.hasFormComponents = !!components.formItems.length
    this.hasConditionalFormComponents = !!conditionalFormComponents.length

    this[FORM_SCHEMA] = this.components.formSchema
    this[STATE_SCHEMA] = this.components.stateSchema
  }

  /**
   * Used for mapping FormData and errors to govuk-frontend's template api, so a page can be rendered
   * @param payload - contains a user's form payload, and any validation errors that may have occurred
   */
  getViewModel(
    payload: FormPayload,
    iteration?: number,
    errors?: FormSubmissionErrors
  ): {
    page: PageControllerBase
    name?: string
    pageTitle: string
    sectionTitle?: string
    showTitle: boolean
    components: ComponentCollectionViewModel
    errors?: FormSubmissionErrors
    isStartPage: boolean
    startPage?: ResponseObject
    backLink?: string
    serviceUrl: string
    phaseTag?: string | undefined
  } {
    let showTitle = true

    let { title: pageTitle, section } = this
    let sectionTitle = section?.hideTitle !== true ? section?.title : ''

    const serviceUrl = `/${this.model.basePath}`

    if (sectionTitle && iteration !== undefined) {
      sectionTitle = `${sectionTitle} ${iteration}`
    }

    const components = this.components.getViewModel(payload, errors)
    const formComponents = components.filter(
      ({ isFormComponent }) => isFormComponent
    )

    // Single form component? Hide title and customise label or legend instead
    if (formComponents.length === 1) {
      const { model } = formComponents[0]
      const { fieldset, label } = model

      // Set as page heading when not following other content
      const isPageHeading = formComponents[0] === components[0]

      // Check for legend or label
      const labelOrLegend = fieldset?.legend ?? label

      // Use legend or label as page heading
      if (labelOrLegend) {
        const size = isPageHeading ? 'l' : 'm'

        labelOrLegend.classes =
          labelOrLegend === label
            ? `govuk-label--${size}`
            : `govuk-fieldset__legend--${size}`

        if (isPageHeading) {
          labelOrLegend.isPageHeading = isPageHeading

          if (pageTitle) {
            labelOrLegend.text = pageTitle
          }

          pageTitle = pageTitle || labelOrLegend.text
        }
      }

      showTitle = !isPageHeading
    }

    return {
      page: this,
      name: this.name,
      pageTitle,
      sectionTitle,
      showTitle,
      components,
      errors,
      isStartPage: false,
      serviceUrl
    }
  }

  /**
   * utility function that checks if this page has any items in the {@link Page.next} object.
   */
  get hasNext() {
    return Array.isArray(this.pageDef.next) && this.pageDef.next.length > 0
  }

  get next() {
    return (this.pageDef.next || [])
      .map((next: { path: string }) => {
        const { path } = next
        const page = this.model.pages.find((page) => {
          return path === page.path
        })

        if (!page) {
          return null
        }

        return {
          ...next,
          page
        }
      })
      .filter((v: object | null) => !!v)
  }

  /**
   * @param state - the values currently stored in a users session
   * @param suppressRepetition - cancels repetition logic
   */
  getNextPage(
    state: FormSubmissionState,
    suppressRepetition = false
  ): PageControllerClass | undefined {
    if (this.repeatField && !suppressRepetition) {
      const requiredCount = reach(state, this.repeatField)
      const otherRepeatPagesInSection = this.model.pages.filter(
        (page) => page.section === this.section && page.repeatField
      )
      const sectionState = state[this.section.name] || {}
      if (
        Object.keys(sectionState[sectionState.length - 1]).length ===
        otherRepeatPagesInSection.length
      ) {
        // iterated all pages at least once
        const lastIteration = sectionState[sectionState.length - 1]
        if (
          otherRepeatPagesInSection.length === this.objLength(lastIteration)
        ) {
          // this iteration is 'complete'
          if (sectionState.length < requiredCount) {
            return this.findPageByPath(Object.keys(lastIteration)[0])
          }
        }
      }
    }

    let defaultLink
    const nextLink = this.next.find((link) => {
      const { condition } = link
      if (condition) {
        return this.model.conditions[condition].fn(state)
      }
      defaultLink = link
      return false
    })
    return nextLink?.page ?? defaultLink?.page
  }

  // TODO: type
  /**
   * returns the path to the next page
   */
  getNext(state: FormSubmissionState) {
    const nextPage = this.getNextPage(state)
    let queryString = ''
    if (nextPage?.repeatField) {
      const requiredCount = reach(state, nextPage.repeatField)
      const otherRepeatPagesInSection = this.model.pages.filter(
        (page) => page.section === this.section && page.repeatField
      )
      const sectionState = state[nextPage.section.name]
      const lastInSection = sectionState?.[sectionState.length - 1] ?? {}
      const isLastComplete =
        Object.keys(lastInSection).length === otherRepeatPagesInSection.length
      const num = sectionState
        ? isLastComplete
          ? this.objLength(sectionState) + 1
          : this.objLength(sectionState)
        : 1

      if (num <= requiredCount) {
        queryString = `?${new URLSearchParams({ num: `${num}` })}`
      }
    }

    if (nextPage) {
      return `/${this.model.basePath || ''}${nextPage.path}${queryString}`
    }
    return this.defaultNextPath
  }

  // TODO: types
  /**
   * gets the state for the values that can be entered on just this page
   */
  getFormDataFromState(state: FormSubmissionState, atIndex: number): FormData {
    const pageState = this.section ? state[this.section.name] : state

    if (this.repeatField) {
      const repeatedPageState =
        pageState?.[atIndex ?? (pageState.length - 1 || 0)] ?? {}
      const values = Object.values(repeatedPageState)

      const newState = values.length
        ? values.reduce((acc: any, page: any) => ({ ...acc, ...page }), {})
        : {}

      return {
        ...this.components.getFormDataFromState(
          newState as FormSubmissionState
        ),
        ...this.model.fieldsForContext.getFormDataFromState(
          newState as FormSubmissionState
        )
      }
    }
    return {
      ...this.components.getFormDataFromState(pageState || {}),
      ...this.model.getContextState(state)
    }
  }

  getStateFromValidForm(payload: FormPayload) {
    return this.components.getStateFromValidForm(payload)
  }

  /**
   * Parses the errors from joi.validate so they can be rendered by govuk-frontend templates
   * @param validationResult - provided by joi.validate
   */
  getErrors(
    validationResult?: ValidationResult
  ): FormSubmissionErrors | undefined {
    if (validationResult?.error) {
      const isoRegex =
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

      return {
        titleText: this.errorSummaryTitle,
        errorList: validationResult.error.details.map((err) => {
          const name = err.path
            .map((name: string, index: number) =>
              index > 0 ? `__${name}` : name
            )
            .join('')

          return {
            path: err.path.join('.'),
            href: `#${name}`,
            name,
            text: err.message.replace(isoRegex, (text) => {
              return format(parseISO(text), 'd MMMM yyyy')
            })
          }
        })
      }
    }

    return undefined
  }

  /**
   * Runs {@link joi.validate}
   * @param value - user's answers
   * @param schema - which schema to validate against
   */
  validate<ValueType extends object>(
    value: ValueType,
    schema: ObjectSchema<ValueType>
  ): FormValidationResult<ValueType> {
    const result = schema.validate(value, this.validationOptions)

    if (result.error) {
      return {
        value: result.value,
        errors: this.getErrors(result)
      }
    }

    return {
      value: result.value
    }
  }

  validateForm(payload: FormPayload) {
    return this.validate(payload, this.formSchema)
  }

  validateState(newState: FormSubmissionState) {
    return this.validate(newState, this.stateSchema)
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`
   */
  getConditionEvaluationContext(model: FormModel, state: FormSubmissionState) {
    // Note: This function does not support repeatFields right now

    let relevantState: FormSubmissionState = {}
    // Start at our startPage
    let nextPage = model.startPage

    // While the current page isn't null
    while (nextPage != null) {
      // Either get the current state or the current state of the section if this page belongs to a section
      const currentState =
        (nextPage.section ? state[nextPage.section.name] : state) ?? {}
      let newValue = {}

      // Iterate all components on this page and pull out the saved values from the state
      for (const component of nextPage.components.items) {
        let componentState = currentState[component.name]

        /**
         * For evaluation context purposes, optional {@link CheckboxesField}
         * with an undefined value (i.e. nothing selected) should default to [].
         * This way conditions are not evaluated against `undefined` which throws errors.
         * Currently these errors are caught and the evaluation returns default `false`.
         * @see {@link PageControllerBase.getNextPage} for `undefined` return value
         * @see {@link FormModel.makeCondition} for try/catch block with default `false`
         * For negative conditions this is a problem because E.g.
         * The condition: 'selectedchecks' does not contain 'someval'
         * should return true IF 'selectedchecks' is undefined, not throw and return false.
         * Similarly for optional {@link RadiosField}, the evaluation context should default to null.
         */
        if (
          componentState === undefined &&
          component instanceof CheckboxesField &&
          !component.options.required
        ) {
          componentState = []
        } else if (
          componentState === undefined &&
          component instanceof RadiosField &&
          !component.options.required
        ) {
          componentState = null
        }

        newValue[component.name] = componentState
      }

      if (nextPage.section) {
        newValue = { [nextPage.section.name]: newValue }
      }

      // Combine our stored values with the existing relevantState that we've been building up
      relevantState = merge(relevantState, newValue)

      // By passing our current relevantState to getNextPage, we will check if we can navigate to this next page (including doing any condition checks if applicable)
      nextPage = nextPage.getNextPage(relevantState)
      // If a nextPage is returned, we must have taken that route through the form so continue our iteration with the new page
    }

    return relevantState
  }

  makeGetRouteHandler() {
    return async (request: Request, h: ResponseToolkit) => {
      const { cacheService } = request.services([])
      const state = await cacheService.getState(request)
      const progress = state.progress ?? []
      const { num } = request.query
      const startPage = this.model.def.startPage
      const payload = this.getFormDataFromState(state, num - 1)

      const isStartPage = this.path === `${startPage}`
      const shouldRedirectToStartPage = !progress.length && !isStartPage

      if (shouldRedirectToStartPage) {
        return startPage?.startsWith('http')
          ? redirectTo(request, h, startPage)
          : redirectTo(request, h, `/${this.model.basePath}${startPage}`)
      }

      const viewModel = this.getViewModel(payload, num)

      viewModel.startPage = startPage?.startsWith('http')
        ? redirectTo(request, h, startPage)
        : redirectTo(request, h, `/${this.model.basePath}${startPage}`)

      this.setPhaseTag(viewModel)
      this.setFeedbackDetails(viewModel, request)

      /**
       * Content components can be hidden based on a condition. If the condition evaluates to true, it is safe to be kept, otherwise discard it
       */
      // Calculate our relevantState, which will filter out previously input answers that are no longer relevant to this user journey
      const relevantState = this.getConditionEvaluationContext(
        this.model,
        state
      )

      // Filter our components based on their conditions using our calculated state
      viewModel.components = viewModel.components.filter((component) => {
        if (
          (component.model.content || component.type === 'Details') &&
          component.model.condition
        ) {
          const condition = this.model.conditions[component.model.condition]
          return condition.fn(relevantState)
        }
        return true
      })

      /**
       * For conditional reveal components (which we no longer support until GDS resolves the related accessibility issues {@link https://github.com/alphagov/govuk-frontend/issues/1991}
       */
      viewModel.components = viewModel.components.map((component) => {
        const evaluatedComponent = component
        const content = evaluatedComponent.model.content
        if (content instanceof Array) {
          evaluatedComponent.model.content = content.filter((item) =>
            item.condition
              ? this.model.conditions[item.condition].fn(relevantState)
              : true
          )
        }
        // apply condition to items for radios, checkboxes etc
        const items = evaluatedComponent.model.items

        if (items instanceof Array) {
          evaluatedComponent.model.items = items.filter((item) =>
            item.condition
              ? this.model.conditions[item.condition].fn(relevantState)
              : true
          )
        }

        return evaluatedComponent
      })

      await this.updateProgress(progress, request, cacheService)

      viewModel.backLink = this.getBackLink(progress)

      return h.view(this.viewName, viewModel)
    }
  }

  /**
   * Updates the progress history stack.
   * Used for when a user clicks the "back" link.
   * Progress is stored in the state.
   */
  protected async updateProgress(
    progress: string[],
    request: Request,
    cacheService: CacheService
  ) {
    const lastVisited = progress.at(-1)
    const currentPath = `${this.model.basePath}${this.path}${request.url.search}`

    if (!lastVisited?.startsWith(currentPath)) {
      if (progress.at(-2) === currentPath) {
        progress.pop()
      } else {
        progress.push(currentPath)

        // Ensure progress history doesn't grow too large
        // by curtailing the array to max length of 100
        const MAX_PROGRESS_ENTRIES = 100

        if (progress.length > MAX_PROGRESS_ENTRIES) {
          progress.shift()
        }
      }
    }

    await cacheService.mergeState(request, { progress })
  }

  /**
   * Get the back link for a given progress.
   */
  protected getBackLink(progress: string[]) {
    return progress.at(-2) ?? this.backLinkFallback
  }

  /**
   * deals with parsing errors and saving answers to state
   */
  async handlePostRequest(
    request: Request,
    h: ResponseToolkit,
    mergeOptions: {
      nullOverride?: boolean
      mergeArrays?: boolean
      /**
       * if you wish to modify the value just before it is added to the user's session (i.e. after validation and error parsing), use the modifyUpdate method.
       * pass in a function, that takes in the update value. Make sure that this returns the modified value.
       */
      modifyUpdate?: <T>(value: T) => any
    } = {}
  ) {
    const { cacheService } = request.services([])
    const payload = (request.payload || {}) as FormPayload
    const formResult = this.validateForm(payload)
    const state = await cacheService.getState(request)
    const progress = state.progress || []
    const { num } = request.query

    /**
     * If there are any errors, render the page with the parsed errors
     */
    if (formResult.errors) {
      // TODO:- refactor to match POST REDIRECT GET pattern.

      return this.renderWithErrors(
        request,
        h,
        payload,
        num,
        progress,
        formResult.errors
      )
    }

    const newState = this.getStateFromValidForm(formResult.value)
    const stateResult = this.validateState(newState)
    if (stateResult.errors) {
      return this.renderWithErrors(
        request,
        h,
        payload,
        num,
        progress,
        stateResult.errors
      )
    }

    let update = this.getPartialMergeState(stateResult.value)
    if (this.repeatField) {
      const updateValue = { [this.path]: update[this.section.name] }
      const sectionState = state[this.section.name]
      if (!sectionState) {
        update = { [this.section.name]: [updateValue] }
      } else if (!sectionState[num - 1]) {
        sectionState.push(updateValue)
        update = { [this.section.name]: sectionState }
      } else {
        sectionState[num - 1] = merge(sectionState[num - 1] ?? {}, updateValue)
        update = { [this.section.name]: sectionState }
      }
    }

    const { nullOverride, mergeArrays, modifyUpdate } = mergeOptions
    if (modifyUpdate) {
      update = modifyUpdate(update)
    }
    await cacheService.mergeState(request, update, nullOverride, mergeArrays)
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`
   */
  makePostRouteHandler() {
    return async (request: Request, h: ResponseToolkit) => {
      const response = await this.handlePostRequest(request, h)
      if (response?.source?.context?.errors) {
        return response
      }
      const { cacheService } = request.services([])
      const savedState = await cacheService.getState(request)
      // This is required to ensure we don't navigate to an incorrect page based on stale state values
      const relevantState = this.getConditionEvaluationContext(
        this.model,
        savedState
      )

      return this.proceed(request, h, relevantState)
    }
  }

  setFeedbackDetails(viewModel, request) {
    const feedbackContextInfo = this.getFeedbackContextInfo(request)
    if (feedbackContextInfo) {
      viewModel.name = feedbackContextInfo.formTitle
    }

    let feedbackLink: string | undefined = ''

    // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
    if (this.def.feedback?.url) {
      feedbackLink = this.feedbackUrlFromRequest(request)
    } else if (this.def.feedback?.emailAddress) {
      feedbackLink = `mailto:${this.def.feedback.emailAddress}`
    } else {
      feedbackLink = config.feedbackLink
    }

    if (feedbackLink?.startsWith('mailto:')) {
      feedbackLink = new URL(feedbackLink).toString() // escape the search params without breaking the ? and & reserved characters in rfc2368
    }

    viewModel.feedbackLink = feedbackLink
  }

  getFeedbackContextInfo(request: Request) {
    if (this.def.feedback?.feedbackForm) {
      return decodeFeedbackContextInfo(
        request.url.searchParams.get(feedbackReturnInfoKey)
      )
    }
  }

  feedbackUrlFromRequest(request: Request): string | undefined {
    if (this.def.feedback?.url) {
      const feedbackLink = new RelativeUrl(this.def.feedback.url)
      const returnInfo = new FeedbackContextInfo(
        this.model.name,
        this.pageDef.title,
        `${request.url.pathname}${request.url.search}`
      )
      feedbackLink.setParam(feedbackReturnInfoKey, returnInfo.toString())
      return feedbackLink.toString()
    }
  }

  makeGetRoute() {
    return {
      method: 'get',
      path: this.path,
      options: this.getRouteOptions,
      handler: this.makeGetRouteHandler()
    } satisfies ServerRoute
  }

  makePostRoute() {
    return {
      method: 'post',
      path: this.path,
      options: this.postRouteOptions,
      handler: this.makePostRouteHandler()
    } satisfies ServerRoute
  }

  findPageByPath(path: string) {
    return this.model.pages.find((page) => page.path === path)
  }

  /**
   * TODO:- proceed is interfering with subclasses
   */
  proceed(request: Request, h: ResponseToolkit, state) {
    return proceed(request, h, this.getNext(state))
  }

  getPartialMergeState(value) {
    return this.section ? { [this.section.name]: value } : value
  }

  get viewName() {
    return 'index'
  }

  get defaultNextPath() {
    return `/${this.model.basePath || ''}/summary`
  }

  get validationOptions() {
    return validationOptions
  }

  get conditionOptions() {
    return this.model.conditionOptions
  }

  get errorSummaryTitle() {
    return 'There is a problem'
  }

  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get getRouteOptions(): RouteOptions {
    return {}
  }

  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get postRouteOptions(): RouteOptions {
    return {}
  }

  get formSchema(): ObjectSchema<FormPayload> {
    return this[FORM_SCHEMA]
  }

  set formSchema(value) {
    this[FORM_SCHEMA] = value
  }

  get stateSchema(): ObjectSchema<FormSubmissionState> {
    return this[STATE_SCHEMA]
  }

  set stateSchema(value) {
    this[STATE_SCHEMA] = value
  }

  private objLength(object: object) {
    return Object.keys(object).length
  }

  private setPhaseTag(viewModel) {
    // Set phase tag if it exists in form definition (even if empty for 'None'),
    // otherwise the template context will simply return server config
    if (this.def.phaseBanner) {
      viewModel.phaseTag = this.def.phaseBanner.phase
    }
  }

  private renderWithErrors(request, h, payload, num, progress, errors) {
    const viewModel = this.getViewModel(payload, num, errors)

    viewModel.backLink = progress[progress.length - 2] ?? this.backLinkFallback
    this.setPhaseTag(viewModel)
    this.setFeedbackDetails(viewModel, request)

    return h.view(this.viewName, viewModel)
  }
}
