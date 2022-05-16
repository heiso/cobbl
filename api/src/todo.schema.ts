import { randomUUID } from 'crypto'
import faker from 'faker'
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
    setTodoIsCompleted(id: ID!, isCompleted: Boolean!): Todo!
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

    setTodoIsCompleted: (parent, { id, isCompleted }, { prisma }) => {
      return prisma.todo.update({
        where: { id },
        data: { isCompleted: isCompleted },
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

    setTodoIsCompleted: (parent, { id, isCompleted }) => {
      return {
        id,
        isCompleted: isCompleted,
      }
    },
  },
}
