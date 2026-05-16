import type { Format } from 'logform'
import { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import LokiTransport from 'winston-loki'
import TelegramTransport from 'winston-telegram'
import type {
	FileTransport,
	LokiTransportOptions,
	TelegramTransportOptions
} from '../interface/interfaces.js'
import type { formatType } from '../interface/type.js'
import ConsolaTransport from './ConsolaTransport.js'
import { formatter } from './Formatter.js'

const { combine, timestamp, prettyPrint, errors } = format

class Transporter {
	private serviceName: string
	dateFormat = 'YYYY-MM-DD HH:mm:ss'

	constructor({
		serviceName,
		dateFormat
	}: {
		serviceName: string
		dateFormat?: string
	}) {
		this.serviceName = serviceName
		if (dateFormat) {
			this.dateFormat = dateFormat
		}
	}

	lokiTransporter(opts: LokiTransportOptions) {
		return new LokiTransport({
			labels: { service_name: this.serviceName },
			...opts,
			format:
				opts.format ||
				combine(timestamp({ format: this.dateFormat }), prettyPrint())
		})
	}

	telegramTransporter(
		botToken: string,
		chatId: number,
		opts: TelegramTransportOptions = {}
	) {
		return new TelegramTransport({
			token: botToken,
			chatId,
			...opts
		})
	}

	// Enhanced detailed log format with structured metadata

	consoleTransporter(type: formatType = 'detailed', customFormat?: Format) {
		let consoleFormat = formatter.getFormatType(type || 'detailed')

		return new ConsolaTransport({
			rawOutput: type === 'json',
			format: combine(
				...(type !== 'json' ? [format.colorize({ all: true })] : []),
				timestamp({ format: this.dateFormat }),
				customFormat ? customFormat : consoleFormat,
				errors({
					stack: true
				})
			)
		})
	}

	fileRotateTransporter(opts: FileTransport) {
		let fileRotateFormat = formatter.getFormatType(opts.formatType || 'json')

		const options: any = {
			datePattern: this.dateFormat,
			zippedArchive: false,
			maxSize: '20m',
			maxFiles: '14d',
			dirname: 'logs',
			level: 'info',
			format: combine(
				timestamp({ format: this.dateFormat }),
				opts.customFormat ? opts.customFormat : fileRotateFormat,
				errors({
					stack: true
				})
			),
			...opts,
			filename: `${this.serviceName}-%DATE%.log`
		}
		if (options.stream === undefined) {
			delete options.stream
		}
		return new DailyRotateFile(options)
	}
}

export default Transporter
