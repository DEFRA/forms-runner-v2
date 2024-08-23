import { config } from '~/src/config/index.js'
import { postJson } from '~/src/server/services/httpService.js'

const submissionUrl = config.get('submissionUrl')

/**
 * Initiates a CDP file upload
 * @param {{fileId: string, initiatedRetrievalKey: string}[]} files - batch of files to persist
 * @param {string} persistedRetrievalKey - final retrieval key when submitting
 */
export async function persistFiles(files, persistedRetrievalKey) {
  const postJsonByType = /** @type {typeof postJson} */ (postJson)

  const payload = {
    files,
    persistedRetrievalKey
  }

  const result = await postJsonByType(`${submissionUrl}/files/persist`, {
    payload
  })

  return result
}
