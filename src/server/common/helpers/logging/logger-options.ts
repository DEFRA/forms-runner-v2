import ecsFormat from '@elastic/ecs-pino-format'

import config from '../../../config'

const loggerOptions = {
  enabled: true, // TODO re-enable !config.get('isTest'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
    remove: true
  },
  level: config.get('logLevel'),
  ...(config.isDev ? { transport: { target: 'pino-pretty' } } : ecsFormat())
}

export { loggerOptions }
