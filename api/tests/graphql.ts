import { User } from '@prisma/client'
import { graphqlOptions } from '../src/app'
import { Authentication } from '../src/core/authentication'
import { Context } from '../src/core/context'
import { computeSchemas } from '../src/core/graphql'
import { prisma } from '../src/core/prisma'
import { Session } from '../src/core/session'

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
