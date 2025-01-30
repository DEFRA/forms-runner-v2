import path from 'node:path'

import {
  type FormDefinition,
  type FormMetadata,
  type SubmitPayload,
  type SubmitResponsePayload
} from '@defra/forms-model'


import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
// import ScorePageController from '~/src/server/controllers/score-page.js'
import { createServer } from '~/src/server/index.js'
import { getForm } from '~/src/server/plugins/engine/configureEnginePlugin.js'
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
  const exampleFormFile = new URL('./server/forms/grants.json', import.meta.url)
    .pathname

  const formDefinition = await getForm(exampleFormFile)

  const formsService: FormsService = {
    getFormMetadata: function (slug: string): Promise<FormMetadata> {
      const date = new Date('2025-01-0100:00:00.000Z')
      const author = {
        id: 'grants-user',
        displayName: 'Grants dev'
      }

      const metadata: FormMetadata = {
        id: '95e92559-968d-44ae-8666-2b1ad3dffd31',
        slug,
        title: 'Grants (Adding value)',
        organisation: 'Defra',
        teamName: 'Grants',
        teamEmail: 'grants@defra.gov.uk',
        submissionGuidance: "Thanks for your submission, we'll be in touch",
        notificationEmail: 'noreply@defra.gov.uk',
        createdBy: author,
        createdAt: date,
        updatedBy: author,
        updatedAt: date,
        live: {
          createdAt: date,
          createdBy: {
            id: '922dce4e-38a5-40d7-9568-ca04e59aedee',
            displayName: 'Grants Eligibility Team'
          },
          updatedAt: date,
          updatedBy: {
            id: '922dce4e-38a5-40d7-9568-ca04e59aedee',
            displayName: 'Grants Eligibility Team'
          }
        }
      }

      return Promise.resolve(metadata)
    },
    getFormDefinition: function (
      id: string,
      state: FormStatus
    ): Promise<FormDefinition> {
      return Promise.resolve(formDefinition)
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
    // formFileName: path.basename(exampleFormFile),
    // formFilePath: path.dirname(exampleFormFile),
    services: { formsService, formSubmissionService },
    controllers: {
      // ScorePageController
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
