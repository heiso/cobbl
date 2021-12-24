import { User } from '@prisma/client'
import { graphqlOptions } from '../../app'
import { Authentication } from '../authentication'
import { Context } from '../context'
import { computeSchemas } from '../graphql'
import { Session } from '../session'
import { prisma } from './prisma'

type Options = {
  asUser?: User
}

const { schema } = computeSchemas(graphqlOptions)

export async function getArgs(options: Options = {}) {
  const session = new Session()
  const auth = new Authentication(session)
  const contextValue: Partial<Context> = {
    session,
    auth,
    prisma: prisma,
  }

  if (options?.asUser) {
    await auth.login(options.asUser)
    contextValue.user = options.asUser
  }

  return {
    schema,
    contextValue,
  }
}
