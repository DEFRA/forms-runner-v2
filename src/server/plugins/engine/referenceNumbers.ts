import { randomBytes } from 'node:crypto'

/**
 * Generates a reference number in the format of `XXX-XXX-XXX`, or `PREFIX-XXX-XXX` if a prefix is provided.
 * Provides no guarantee on uniqueness.
 */
export function generateReferenceNumber(prefix?: string) {
  const segmentSize = 4
  const segmentCount = prefix ? 2 : 3
  prefix = prefix ? `${prefix}-` : ''

  const segments = Array.from(
    { length: segmentCount },
    () => randomBytes(segmentSize).toString('hex').slice(0, segmentSize) // 0-9a-f, might be good enough?
  )

  return `${prefix}${segments.join('-')}`.toUpperCase()
}
