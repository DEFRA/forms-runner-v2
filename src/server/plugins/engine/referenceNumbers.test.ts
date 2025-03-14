import { generateReferenceNumber } from '~/src/server/plugins/engine/referenceNumbers.js'

describe('generateReferenceNumber', () => {
  it('should generate a reference number with 3 segments when no prefix is provided', () => {
    const referenceNumber = generateReferenceNumber()
    const segments = referenceNumber.split('-')

    expect(segments).toHaveLength(3)

    segments.forEach((segment) => {
      expect(segment).toHaveLength(4)
    })
  })

  it('should generate a reference number with 2 segments when a prefix is provided', () => {
    const prefix = 'ABC'
    const referenceNumber = generateReferenceNumber(prefix)
    const segments = referenceNumber.split('-')

    expect(segments).toHaveLength(3) // 1 for prefix and 2 for segments
    expect(segments[0]).toBe(prefix)

    segments.slice(1).forEach((segment) => {
      expect(segment).toHaveLength(4)
    })
  })

  it('should generate different reference numbers on subsequent calls', () => {
    const referenceNumber1 = generateReferenceNumber()
    const referenceNumber2 = generateReferenceNumber()
    expect(referenceNumber1).not.toBe(referenceNumber2)
  })
})
