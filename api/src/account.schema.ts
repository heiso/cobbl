import { gql } from 'graphql-tag'
import { ErrorCode, Resolvers } from '../generated/graphql'
import { log } from './core/logger'
import { generateHash, safeCompare } from './core/password'
import { isRateLimited } from './core/rateLimiter'

export const typeDefs = gql`
  extend enum ErrorCode {
    EMAIL_ALREADY_EXISTS
  }

  type Account {
    id: String!
    email: String!
  }

  extend type Query {
    account: Account @isPublic
  }

  extend type Mutation {
    signup(email: String!, password: String!): Boolean! @isPublic
    login(email: String!, password: String!): Boolean! @isPublic
    logout: Boolean!
  }
`

export const resolvers: Resolvers = {
  Query: {
    account(root, args, { user }) {
      return user || null
    },
  },

  Mutation: {
    async signup(root, { email, password }, { prisma, auth }) {
      const isEmailUsed = await prisma.user.count({ where: { email } })
      if (isEmailUsed) {
        throw new Error(ErrorCode.EMAIL_ALREADY_EXISTS)
      }

      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword: generateHash(password),
        },
      })

      await auth.login(user)

      return true
    },

    async login(root, { email, password }, { auth, prisma, ip }) {
      /**
       * In any case, we still want to take approximately the same time to respond.
       * The purpose is to avoid timing attack, the request would be fast when no user is found and >500ms if a user is found
       * and then an attacker could easyly scan our user's emails
       */
      const fakePasswordTest = () => {
        safeCompare(
          'Négatif, je suis une mite en pull-over',
          '8fde34560b725c901fe1a443b0acea4aac101b94c5e8bbba87d18875388a955a5bb008b1979138f9d8845426cc3ab68fc0a2b2d02bf1523d4b5b8be7ccfff88a:f549e491ddfc32e03aed9a45b2878a91'
        )
      }

      if (await isRateLimited('login-by-ip', ip)) {
        fakePasswordTest()
        log.warn('too many request per ip per minute')
        throw new Error(ErrorCode.BAD_USER_INPUT)
      }

      const user = await prisma.user.findFirst({
        where: { email },
        select: { hashedPassword: true, id: true },
      })

      if (!user || !user.hashedPassword) {
        fakePasswordTest()
        throw new Error(ErrorCode.BAD_USER_INPUT)
      } else {
        if (!safeCompare(password, user.hashedPassword)) {
          throw new Error(ErrorCode.BAD_USER_INPUT)
        }

        await auth.login(user)
        return true
      }
    },

    async logout(root, args, { auth }) {
      await auth.logout()
      return true
    },
  },
}
