import { isRateLimited } from '../rateLimiter'
import { redis } from '../redis'

describe('Security', () => {
  describe('isRateLimited', () => {
    const fakeIp = '127.0.0.1'

    beforeEach(async () => {
      await redis.flushdb()
    })

    it('should return false on first call for a given ip', async () => {
      expect(await isRateLimited('test', fakeIp, 10, 60)).toBeFalsy()
    })

    it('should return false on 10th call for a given ip', async () => {
      for (let i = 0; i < 9; i++) {
        await isRateLimited('test', fakeIp, 10, 60)
      }
      expect(await isRateLimited('test', fakeIp, 10, 60)).toBeFalsy()
    })

    it('should return true on 11th call for a given ip', async () => {
      for (let i = 0; i < 10; i++) {
        await isRateLimited('test', fakeIp, 10, 60)
      }
      expect(await isRateLimited('test', fakeIp, 10, 60)).toBeTruthy()
    })
  })
})
