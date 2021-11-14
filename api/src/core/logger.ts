import { createLogger, format, transports } from 'winston'

const defaultFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp({ format: 'HH:mm:ss' })
)

const developmentFormat = format.combine(
  defaultFormat,
  format.colorize(),
  format.printf(({ timestamp, level, message, stack }) => {
    if (Array.isArray(message) && message.every((msg) => msg instanceof Error)) {
      return `${timestamp} [${level}]: ${message.map(
        (err: Error) => `${err.message}\n${err.stack}\n \n`
      )}`
    }
    return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}}\n` : ''}`
  })
)

export const log = createLogger({
  level: 'info',
  handleExceptions: true,
  format:
    process.env.NODE_ENV && ['development', 'test', 'ci'].includes(process.env.NODE_ENV)
      ? developmentFormat
      : format.combine(defaultFormat, format.json()),
  transports: [new transports.Console()],
})
