import { getTraceId } from '@defra/hapi-tracing'

import { config } from '~/src/config/index.js'

const tracingHeader = config.get('tracing').header

/**
 * Returns a set of headers to use in an HTTP request.
 * @returns {Record<string, string> | undefined}
 */
export function getHeaders() {
  if (!tracingHeader) {
    return undefined
  }

  const traceId = getTraceId()

  return traceId ? { [tracingHeader]: traceId } : undefined
}

/**
 * @import Wreck from '@hapi/wreck'
 */
