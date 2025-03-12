import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { getValidToken } from '~/src/server/utils/token-manager.js'

const CV_API_ENDPOINT = config.get('consolidatedView.apiEndpoint')
const CV_API_AUTH_EMAIL = config.get('consolidatedView.authEmail')

const logger = createLogger()

/**
 * @typedef {object} BusinessResponse
 * @property {object} [data] - The response data object
 * @property {object} [data.business] - Business information
 * @property {string} [data.business.sbi] - Standard Business Identifier
 * @property {string} [data.business.organisationId] - Organisation identifier
 * @property {object} [data.business.customer] - Customer details
 * @property {string} [data.business.customer.firstName] - Customer's first name
 * @property {string} [data.business.customer.lastName] - Customer's last name
 * @property {string} [data.business.customer.role] - Customer's role
 */

/**
 * Fetches business details from Consolidated View
 * @param {number} sbi - Standard Business Identifier
 * @param {number} crn - Customer Reference Number
 * @returns {Promise<BusinessResponse>} - Promise that resolves to the business details
 * @throws {Error} - If the request fails
 */
export async function fetchBusinessDetails(sbi, crn) {
  let response
  const query = `
    query Business {
        business(sbi: "${sbi}") {
            sbi
            organisationId
            customer(crn: "${crn}") {
                firstName
                lastName
                role
            }
        }
    }`

  const token = await getValidToken()

  try {
    response = await fetch(CV_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        email: CV_API_AUTH_EMAIL
      },
      body: JSON.stringify({
        query
      })
    })

    if (!response.ok) {
      /**
       * @type {Error & {code?: number}}
       */
      const error = new Error(response.statusText)
      error.code = response.status
      throw error
    }
  } catch (error) {
    logger.error(error, `Failed to fetch business details for sbi ${sbi}`)
    throw error
  }

  return /** @type {Promise<BusinessResponse>} */ (response.json())
}
