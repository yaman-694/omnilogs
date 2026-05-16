import { createConsola } from 'consola'
import type { ConsolaInstance, LogType } from 'consola'
import TransportStream from 'winston-transport'

const messageSymbol = Symbol.for('message')

const levelToConsolaType: Record<string, LogType> = {
	alert: 'fatal',
	critical: 'fatal',
	debug: 'debug',
	emergency: 'fatal',
	error: 'error',
	fatal: 'fatal',
	info: 'info',
	notice: 'info',
	success: 'success',
	trace: 'trace',
	verbose: 'verbose',
	warn: 'warn',
	warning: 'warn'
}

class ConsolaTransport extends TransportStream {
	private logger: ConsolaInstance
	private rawOutput: boolean

	constructor({
		rawOutput = false,
		...opts
	}: TransportStream.TransportStreamOptions & { rawOutput?: boolean } = {}) {
		super(opts)
		this.rawOutput = rawOutput
		this.logger = createConsola({ level: Infinity })
	}

	log(info: any, next: () => void) {
		setImmediate(() => {
			this.emit('logged', info)
		})

		const message = String(info[messageSymbol] ?? info.message)

		if (this.rawOutput) {
			this.logger.log.raw(message)
			next()
			return
		}

		const logType = levelToConsolaType[String(info.level)] || 'log'
		this.logger[logType](message)
		next()
	}
}

export default ConsolaTransport
