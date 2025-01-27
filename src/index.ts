import { type IncomingMessage } from 'http'
import path from 'node:path'

import {
  type FormDefinition,
  type FormMetadata,
  type SubmitPayload,
  type SubmitResponsePayload
} from '@defra/forms-model'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { createServer } from '~/src/server/index.js'
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

  const formsService: FormsService = {
    getFormMetadata: function (slug: string): Promise<FormMetadata> {
      const now = new Date()
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
        notificationEmail:
          'cl-defra-tactical-grants-test-rpa-email@equalexperts.com',
        createdBy: author,
        createdAt: now,
        updatedBy: author,
        updatedAt: now
      }

      return Promise.resolve(metadata)
    },
    getFormDefinition: function (
      id: string,
      state: FormStatus
    ): Promise<FormDefinition> {
      throw new Error(
        `Function not implemented. Params id: ${id}, state: ${state}`
      )
    }
  }

  const formSubmissionService: FormSubmissionService = {
    persistFiles: function (
      files: { fileId: string; initiatedRetrievalKey: string }[],
      persistedRetrievalKey: string
    ): Promise<
      | { res: IncomingMessage; error: Error | object; payload?: undefined }
      | { res: IncomingMessage; payload: object; error?: undefined }
    > {
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
    formFileName: path.basename(exampleFormFile),
    formFilePath: path.dirname(exampleFormFile),
    services: { formsService, formSubmissionService }
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
