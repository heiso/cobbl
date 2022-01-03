import { gql } from 'graphql-tag'
import {
  testAccountQuery,
  testLoginMutation,
  testSignupMutation,
} from '../../generated/graphql.test'
import { generateHash } from '../core/password'
import { getArgs } from '../core/__tests__/graphql'
import { prisma } from '../core/__tests__/prisma'

gql`
  fragment Account on Account {
    id
    email
  }

  query Account {
    account {
      ...Account
    }
  }

  mutation signup($email: String!, $password: String!) {
    signup(email: $email, password: $password)
  }

  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ...Account
    }
  }

  mutation logout {
    logout
  }
`

describe('Account', () => {
  const email = 'hubert.fiorentini@wazabi.co'
  const password = 'NotASword1!'
  const hashedPassword = generateHash(password)

  describe('query account', () => {
    it('should return null when there are no logged in user', async () => {
      const result = await testAccountQuery(await getArgs())
      expect(result.data?.account).toBeNull()
    })

    it('should return the logged in user', async () => {
      const user = await prisma.user.create({ data: { email, hashedPassword } })
      const result = await testAccountQuery(await getArgs({ asUser: user }))
      expect(result.data?.account).toEqual({ id: user.id, email: user.email })
    })
  })

  describe('mutation signup', () => {
    it('should return an error when the email is already used', async () => {
      const user = await prisma.user.create({
        data: { email },
      })

      const result = await testSignupMutation(await getArgs(), {
        email: user.email,
        password,
      })

      expect(result.errors).toHaveLength(1)
    })

    it('should create a user in database', async () => {
      await testSignupMutation(await getArgs(), {
        email,
        password,
      })

      expect(await prisma.user.count({ where: { email } })).not.toBe(0)
    })

    it('should login the user after signing up', async () => {
      const args = await getArgs()
      await testSignupMutation(args, {
        email,
        password,
      })
      expect(args.contextValue?.auth?.isAuthenticated).toBe(true)
    })

    it('should return `true` after signing up', async () => {
      const result = await testSignupMutation(await getArgs(), {
        email,
        password,
      })
      expect(result.data?.signup).toBe(true)
    })
  })

  describe('mutation login', () => {
    beforeEach(async () => {
      await prisma.user.create({ data: { email, hashedPassword } })
    })

    it('should return an error when the email is not associated to a user', async () => {
      const result = await testLoginMutation(await getArgs(), {
        email: 'pl@ypus.com',
        password,
      })

      expect(result.errors).toHaveLength(1)
    })

    it('should not login when the email is not associated to a user', async () => {
      const args = await getArgs()
      await testLoginMutation(args, {
        email: 'pl@ypus.com',
        password,
      })

      expect(args.contextValue?.auth?.isAuthenticated).toBe(false)
    })

    it('should return an error when the password is not valid', async () => {
      const result = await testLoginMutation(await getArgs(), {
        email,
        password: 'not-the-Passw0rd!',
      })

      expect(result.errors).toHaveLength(1)
    })

    it('should not login when the password is not valid', async () => {
      const args = await getArgs()
      await testLoginMutation(args, {
        email,
        password: 'not-the-Passw0rd!',
      })

      expect(args.contextValue?.auth?.isAuthenticated).toBe(false)
    })

    it('should login the user when credentials are valid', async () => {
      const args = await getArgs()
      await testLoginMutation(args, {
        email,
        password,
      })

      expect(args.contextValue?.auth?.isAuthenticated).toBe(true)
    })

    it('should return `true` after loging in', async () => {
      const result = await testLoginMutation(await getArgs(), {
        email,
        password,
      })

      expect(result.data?.login).toBe(true)
    })
  })
})
