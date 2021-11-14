import { app } from './app'
import { log } from './core/logger'

app.listen({ port: Number(process.env.PORT) }, () => {
  log.info(`🚀 To infinity...and beyond!`)
})
