import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { User } from '@prisma/client'
import { defaultFieldResolver, GraphQLSchema } from 'graphql'
import { DefaultState, Middleware } from 'koa'
import { ErrorCode } from '../../generated/graphql'
import { Context } from './context'

export class Authentication {
  private session: Context['session']

  constructor(session: Context['session']) {
    this.session = session
    if (!this.session.data.userId) {
      this.session.data.userId = null
    }
  }

  async login(user: Partial<User> & Pick<User, 'id'>) {
    this.session.data.userId = user.id
    await this.session.persist()
  }

  async logout() {
    await this.session.delete()
  }

  get userId(): User['id'] | null {
    return this.session.data.userId ?? null
  }

  get isAuthenticated() {
    return !!this.session.data.userId
  }
}

export const authenticationSchemaTransformer = (schema: GraphQLSchema) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      if (typeName === 'Query' || typeName === 'Mutation') {
        const { resolve = defaultFieldResolver } = fieldConfig
        const isPublicDirective = getDirective(schema, fieldConfig, 'isPublic')?.[0]

        if (!isPublicDirective) {
          fieldConfig.resolve = async (root, args, context: Context, info) => {
            if (!context.auth.userId) {
              throw new Error(ErrorCode.UNAUTHENTICATED)
            }

            return resolve.apply(resolve, [root, args, context, info])
          }
        }
      }

      return fieldConfig
    },
  })
}

export function authenticationMiddleware(): Middleware<DefaultState, Context> {
  return async function authenticationMiddleware(ctx, next) {
    const auth = new Authentication(ctx.session)
    ctx.auth = auth

    if (auth.isAuthenticated && auth.userId) {
      const user = await ctx.prisma.user.findUnique({ where: { id: auth.userId } })
      if (user) {
        ctx.user = user
      } else {
        await auth.logout()
      }
    }

    return next()
  }
}
