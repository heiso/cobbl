import { createLogger, format, transports } from 'winston'

const defaultFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp({ format: 'HH:mm:ss' })
)

const developmentFormat = format.combine(
  defaultFormat,
  format.colorize(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format.printf(({ timestamp, level, message, stack }) => {
    if (Array.isArray(message) && message.every((msg) => msg instanceof Error)) {
      return `${message.map((err: Error) => `[${level}]: ${err.message}\n${err.stack}\n \n`)}`
    }
    return `[${level}]: ${message}${stack ? `\n${stack}}\n` : ''}`
  })
)

export const log = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  handleExceptions: true,
  format:
    process.env.NODE_ENV && ['development', 'test', 'ci'].includes(process.env.NODE_ENV)
      ? developmentFormat
      : format.combine(defaultFormat, format.json()),
  transports: [new transports.Console()],
})
