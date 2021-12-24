import { PrismaClient } from '@prisma/client'
import { generateHash } from '../src/core/password'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      email: 'heiso@test.dev',
      hashedPassword: generateHash('NotASword1!'),
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
