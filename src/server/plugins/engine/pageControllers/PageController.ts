import { PageControllerBase } from './PageControllerBase.js'
import type { Request, ResponseToolkit } from '@hapi/hapi'

export class PageController extends PageControllerBase {
  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get getRouteOptions(): {
    ext: any
  } {
    return {
      ext: {
        onPostHandler: {
          method: (_request: Request, h: ResponseToolkit) => {
            return h.continue
          }
        }
      }
    }
  }

  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get postRouteOptions(): {
    payload?: any
    ext: any
  } {
    return {
      payload: {
        output: 'stream',
        parse: true,
        maxBytes: Number.MAX_SAFE_INTEGER,
        failAction: 'ignore'
      },
      ext: {
        onPreHandler: {
          method: async (request: Request, h: ResponseToolkit) => {
            const { uploadService } = request.services([])
            return uploadService.handleUploadRequest(request, h, this.pageDef)
          }
        },
        onPostHandler: {
          method: async (_request: Request, h: ResponseToolkit) => {
            return h.continue
          }
        }
      }
    }
  }
}
