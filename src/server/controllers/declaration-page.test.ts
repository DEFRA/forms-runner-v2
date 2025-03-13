import DeclarationPageController from '~/src/server/controllers/declaration-page.ts'
import { SummaryViewModel } from '~/src/server/plugins/engine/models/SummaryViewModel.ts'
import { SummaryPageController } from '~/src/server/plugins/engine/pageControllers/SummaryPageController.ts'

jest.mock('~/src/server/plugins/engine/models/SummaryViewModel.ts', () => ({
  SummaryViewModel: jest.fn()
}))

jest.mock('~/src/server/plugins/engine/services/formsService.js', () => ({
  getFormMetadata: jest.fn()
}))

describe('DeclarationPageController', () => {
  let controller,
    model,
    pageDef,
    request,
    context,
    h,
    formSubmitFunction,
    outputSubmitFunction

  beforeEach(() => {
    formSubmitFunction = jest.fn().mockResolvedValue({})
    outputSubmitFunction = jest.fn().mockResolvedValue({})
    model = {
      def: { name: 'declaration' },
      sections: [],
      services: {
        formsService: {
          getFormMetadata: jest
            .fn()
            .mockResolvedValue({ notificationEmail: 'some@email.com' })
        },
        formSubmissionService: {
          persistFiles: jest.fn().mockResolvedValue({}),
          submit: formSubmitFunction
        },
        outputService: {
          submit: outputSubmitFunction
        }
      },
      pages: []
    }
    pageDef = { path: '/declaration' }
    controller = new DeclarationPageController(model, pageDef)

    request = {
      path: '/declaration',
      params: { slug: 'test-form' },
      query: { returnUrl: '/return-url' },
      services: jest.fn(() => ({})),
      logger: {
        info: jest.fn(() => ({}))
      },
      yar: { id: 'some-session' }
    }
    context = { state: {}, relevantPages: [] }
    h = { view: jest.fn(), redirect: jest.fn() }

    SummaryViewModel.mockImplementation(() => ({
      backLink: '/back',
      feedbackLink: '/feedback',
      phaseTag: 'beta',
      context: {
        relevantPages: []
      }
    }))
  })

  it('should extend SummaryPageController', () => {
    expect(controller).toBeInstanceOf(SummaryPageController)
  })

  it('should set correct view name', () => {
    expect(controller.viewName).toBe('grants/declaration.html')
  })

  it('should add consentOptional to view model', () => {
    const viewModel = controller.getSummaryViewModel(request, context)
    expect(viewModel.consentOptional).toEqual({
      value: 'CONSENT_OPTIONAL',
      text: '(Optional) I consent to being contacted by Defra or a third party about service improvements',
      checked: false,
      selected: false
    })
  })

  it('GET handler should render declaration view with correct model', async () => {
    await controller.makeGetRouteHandler()(request, context, h)
    expect(h.view).toHaveBeenCalledWith(
      'grants/declaration.html',
      expect.objectContaining({
        consentOptional: expect.objectContaining({
          value: 'CONSENT_OPTIONAL',
          text: '(Optional) I consent to being contacted by Defra or a third party about service improvements'
        })
      })
    )
  })

  it('POST handler should submit form and clear state', async () => {
    const cacheService = {
      setConfirmationState: jest.fn(),
      clearState: jest.fn()
    }
    request.services = jest.fn(() => ({ cacheService }))

    const proceedSpy = jest
      .spyOn(controller, 'proceed')
      .mockResolvedValue('redirect-url')

    await controller.makePostRouteHandler()(request, context, h)

    expect(formSubmitFunction).toHaveBeenCalled()
    expect(outputSubmitFunction).toHaveBeenCalled()
    expect(cacheService.setConfirmationState).toHaveBeenCalledWith(request, {
      confirmed: true
    })
    expect(cacheService.clearState).toHaveBeenCalledWith(request)
    expect(proceedSpy).toHaveBeenCalledWith(
      request,
      h,
      controller.getStatusPath()
    )
  })
})
