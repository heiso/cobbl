import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'
import { gql } from 'graphql-tag'
import { Resolvers } from '../generated/graphql'
import { MockResolvers } from '../generated/graphql.mock'

export const typeDefs = gql`
  type Todo {
    id: ID!
    label: String!
    isCompleted: Boolean!
  }

  input TodoInput {
    id: ID!
    label: String!
    isCompleted: Boolean!
  }

  extend type Query {
    todos: [Todo!]!
  }

  extend type Mutation {
    addTodo(label: String!): Todo!
    removeTodo(id: ID!): Boolean!
    updateTodo(input: TodoInput!): Todo!
  }
`

export const resolvers: Resolvers = {
  Query: {
    todos: (parent, args, { prisma, user }) => {
      return prisma.todo.findMany({ where: { user } })
    },
  },

  Mutation: {
    addTodo: (parent, { label }, { prisma, user }) => {
      return prisma.todo.create({ data: { label, userId: user.id } })
    },

    removeTodo: async (parent, { id }, { prisma }) => {
      await prisma.todo.delete({ where: { id } })
      return true
    },

    updateTodo: (parent, { input }, { prisma }) => {
      return prisma.todo.update({
        where: { id: input.id },
        data: {
          label: input.label,
          isCompleted: input.isCompleted,
        },
      })
    },
  },
}

export const mockResolvers: MockResolvers = {
  Todo: {
    label: () => faker.lorem.sentence(4),
  },

  Query: {
    todos: () => {
      return [...Array(faker.datatype.number({ min: 1, max: 6 }))].map(() => ({
        id: randomUUID(),
        isCompleted: false,
      }))
    },
  },

  Mutation: {
    addTodo: (parent, { label }) => {
      return {
        id: randomUUID(),
        label,
      }
    },

    removeTodo: () => true,

    updateTodo: (parent, { input }) => {
      return {
        id: input.id,
        label: input.label || undefined,
        isCompleted: input.isCompleted || false,
      }
    },
  },
}
