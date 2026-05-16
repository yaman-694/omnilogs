import { createLogger } from '../index.js'

const logger = createLogger({
	serviceName: 'default-service',
	transports: {
		console: { type: 'json' },
		fileRotate: {
			maxSize: '20m',
			maxFiles: '1d',
			level: 'info'
		}
	}
})

logger.error('This is an error message', { errorCode: 123, user: 'john_doe' })
logger.info('This is an info message')
logger.debug('This is a debug message')
logger.warn('This is a warning message')
logger.critical('This is a critical message')
logger.success('This is a success message')
