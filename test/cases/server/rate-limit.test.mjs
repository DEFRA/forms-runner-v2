import createServer from '../../../src/server/index.js'

describe('Rate limit', () => {
  let server

  const options = {
    userLimit: 1,
    userCache: {
      expiresIn: 5000
    }
  }

  // Create server before each test
  beforeAll(async () => {
    server = await createServer({
      formFileName: 'basic-v1.json',
      formFilePath: __dirname,
      rateOptions: options
    })
    server.route({
      method: 'GET',
      path: '/start',
      handler: () => {
        return {}
      },
      options: {
        plugins: {
          'hapi-rate-limit': true
        }
      }
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  test.only('plugin is registered during server start', async () => {
    await expect(server.start()).resolves.not.toThrow()

    expect(server.registrations).toEqual(
      expect.objectContaining({
        'hapi-rate-limit': expect.objectContaining({
          name: 'hapi-rate-limit',
          options
        })
      })
    )
  })
})
