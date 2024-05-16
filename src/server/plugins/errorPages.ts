import { type Request, type ResponseToolkit } from '@hapi/hapi'

/*
 * Add an `onPreResponse` listener to return error pages
 */
export default {
  plugin: {
    name: 'error-pages',
    register: (server) => {
      server.ext('onPreResponse', (request: Request, h: ResponseToolkit) => {
        const response = request.response

        if ('isBoom' in response && response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode

          // Check for a form model on the request
          // and use it to set the correct service name
          // and start page path. In the event of a error
          // happening inside a "form" level request, the header
          // then displays the contextual form text and href
          const model = request.app.model
          const viewModel = model
            ? {
                name: model.name,
                serviceStartPage: `/${model.basePath}`
              }
            : undefined

          // In the event of 404
          // return the `404` view
          if (statusCode === 404) {
            return h.view('404', viewModel).code(statusCode)
          }

          request.log('error', {
            statusCode,
            data: response.data,
            message: response.message,
            stack: response.stack
          })

          request.logger.error(response.stack)

          // The return the `500` view
          return h.view('500', viewModel).code(statusCode)
        }
        return h.continue
      })
    }
  }
}
