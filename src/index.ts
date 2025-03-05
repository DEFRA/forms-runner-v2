import {
  type FormDefinition,
  type FormMetadata,
  type SubmitPayload,
  type SubmitResponsePayload
} from '@defra/forms-model'
import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import ScorePageController from '~/src/server/controllers/score-page.js'
import { createServer } from '~/src/server/index.js'
import { getForm } from '~/src/server/plugins/engine/configureEnginePlugin.js'
import { engine } from '~/src/server/plugins/engine/helpers.js'
import * as outputService from '~/src/server/plugins/engine/services/notifyService.js'
import { type FormStatus } from '~/src/server/routes/types.js'
import {
  type FormSubmissionService,
  type FormsService
} from '~/src/server/types.js'

const logger = createLogger()

process.on('unhandledRejection', (error) => {
  logger.info('Unhandled rejection')
  logger.error(error)
  throw error
})

/**
 * Main entrypoint to the application.
 */
async function startServer() {
  // Load form definitions
  const exampleGrantPath = new URL(
    './server/forms/example-grant.json',
    import.meta.url
  ).pathname
  const exampleGrantDefinition = await getForm(exampleGrantPath)

  const addingValuePath = new URL(
    './server/forms/adding-value.json',
    import.meta.url
  ).pathname
  const addingValueDefinition = await getForm(addingValuePath)
  const environment = config.get('cdpEnvironment')

  addingValueDefinition.pages.forEach((page) => {
    const events = page.events
    if (events) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (events.onLoad?.options.url && environment !== 'local') {
        events.onLoad.options.url = events.onLoad.options.url.replace(
          'cdpEnvironment',
          environment
        )
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (events.onLoad?.options.url && environment === 'local') {
        events.onLoad.options.url =
          'http://localhost:3001/scoring/api/v1/adding-value/score?allowPartialScoring=true'
      }
    }
  })

  engine.registerFilter('money', (value) => {
    if (typeof value !== 'number') return
    return value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })
  })

  // Form metadata
  const now = new Date()
  const user = {
    id: 'grants-user',
    displayName: 'Grants dev'
  }
  const author = {
    createdAt: now,
    createdBy: user,
    updatedAt: now,
    updatedBy: user
  }

  const metadata = {
    organisation: 'Defra',
    teamName: 'Grants',
    teamEmail: 'grants@defra.gov.uk',
    submissionGuidance: "Thanks for your submission, we'll be in touch",
    notificationEmail:
      'cl-defra-tactical-grants-test-rpa-email@equalexperts.com',
    ...author,
    live: author
  }

  const exampleGrantMetadata: FormMetadata = {
    id: '5eeb9f71-44f8-46ed-9412-3d5e2c5ab2bc',
    slug: 'example-grant',
    title: 'Example grant',
    ...metadata
  }

  const addingValueMetadata: FormMetadata = {
    id: '95e92559-968d-44ae-8666-2b1ad3dffd31',
    slug: 'adding-value',
    title: 'Adding value',
    ...metadata
  }

  const formsService: FormsService = {
    getFormMetadata: function (slug: string): Promise<FormMetadata> {
      switch (slug) {
        case exampleGrantMetadata.slug:
          return Promise.resolve(exampleGrantMetadata)
        case addingValueMetadata.slug:
          return Promise.resolve(addingValueMetadata)
        default:
          throw Boom.notFound(`Form '${slug}' not found`)
      }
    },
    getFormDefinition: function (
      id: string,
      _state: FormStatus
    ): Promise<FormDefinition> {
      switch (id) {
        case exampleGrantMetadata.id:
          return Promise.resolve(exampleGrantDefinition)
        case addingValueMetadata.id:
          return Promise.resolve(addingValueDefinition)
        default:
          throw Boom.notFound(`Form '${id}' not found`)
      }
    }
  }

  const formSubmissionService: FormSubmissionService = {
    persistFiles: function (
      files: { fileId: string; initiatedRetrievalKey: string }[],
      persistedRetrievalKey: string
    ): Promise<object> {
      throw new Error(
        `Function not implemented. Params files: ${JSON.stringify(files)}, persistedRetrievalKey: ${persistedRetrievalKey}`
      )
    },
    submit: function (
      data: SubmitPayload
    ): Promise<SubmitResponsePayload | undefined> {
      return Promise.resolve({
        message: 'string',
        result: {
          files: {
            main: `${data.sessionId}_grants.csv`,
            repeaters: Object.fromEntries(
              data.repeaters.map((item) => [
                item.name,
                `${data.sessionId}_${item.name}`
              ])
            )
          }
        }
      })
    }
  }

  const server = await createServer({
    services: { formsService, formSubmissionService, outputService },
    controllers: {
      ScorePageController
    }
  })

  await server.start()

  process.send?.('online')

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your frontend on http://localhost:${config.get('port')}`
  )
}

startServer().catch((error: unknown) => {
  logger.info('Server failed to start :(')
  logger.error(error)
})
