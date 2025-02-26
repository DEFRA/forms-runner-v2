import { config } from '~/src/config/index.js'
import { configureBlankiePlugin } from '~/src/server/plugins/blankie.js'

describe('Server Blankie Plugin', () => {
  test('configuration default options are provided', () => {
    config.set('googleAnalyticsTrackingId', '')

    const { options } = configureBlankiePlugin()

    expect(options).toEqual({
      defaultSrc: ['self'],
      fontSrc: ['self', 'data:'],
      frameSrc: ['self', 'data:'],
      connectSrc: ['self'],
      scriptSrc: ['self', 'strict-dynamic', 'unsafe-inline'],
      styleSrc: ['self', 'unsafe-inline'],
      imgSrc: ['self'],
      generateNonces: true
    })
  })

  test('configuration default and GA options are provided', () => {
    config.set('googleAnalyticsTrackingId', '12345')

    const { options } = configureBlankiePlugin()

    expect(options).toEqual({
      defaultSrc: ['self'],
      fontSrc: ['self', 'data:'],
      frameSrc: ['self', 'data:'],
      connectSrc: [
        'self',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.googletagmanager.com'
      ],
      scriptSrc: [
        'self',
        'strict-dynamic',
        'unsafe-inline',
        'https://*.googletagmanager.com'
      ],
      styleSrc: ['self', 'unsafe-inline'],
      imgSrc: [
        'self',
        'https://*.google-analytics.com',
        'https://*.googletagmanager.com'
      ],
      generateNonces: true
    })
  })
})
