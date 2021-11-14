import { PrismaClient } from '@prisma/client'
import { DefaultState, Middleware } from 'koa'
import { Context } from './context'

export const prisma = new PrismaClient()

export function prismaMiddleware(): Middleware<DefaultState, Context> {
  return function prismaMiddleware(ctx, next) {
    ctx.prisma = prisma
    return next()
  }
}
