import { config } from 'dotenv-flow'
import Redis from 'ioredis-mock'

config({ path: `${__dirname}/../` })

jest.setMock('ioredis', Redis)
