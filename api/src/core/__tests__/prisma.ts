import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let models: any[]

export async function resetDB(): Promise<void> {
  const counts = await Promise.all(models.map((model) => model.count()))

  const promises = counts.reduce<Promise<unknown>[]>((acc, count, index) => {
    if (count > 0) {
      acc.push(models[index].deleteMany())
    }
    return acc
  }, [])

  if (!promises.length) {
    return
  }

  await Promise.allSettled(promises)

  return resetDB()
}

beforeAll(async () => {
  models = Object.values(prisma).filter((model) => model?.deleteMany)
})

afterEach(async () => {
  await resetDB()
})

afterAll(async () => {
  await prisma.$disconnect()
})
