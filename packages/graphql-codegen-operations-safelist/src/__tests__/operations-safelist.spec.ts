import { Source } from '@graphql-tools/utils'
import { readFileSync } from 'fs'
import { buildClientSchema, parse } from 'graphql'
import { every, some } from 'lodash'
import { join, resolve } from 'path'
import { hashQuery, plugin } from '..'

const githuntPath = resolve(__dirname, '../../../graphql-codegen-core/githunt/')

function getDocument(name: string): Source {
  return {
    document: parse(readFileSync(join(githuntPath, name), { encoding: 'utf-8' })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = buildClientSchema(require(join(githuntPath, 'schema.json')))
const documents = [
  getDocument('comment-added.subscription.graphql'),
  getDocument('comment.query.graphql'),
  getDocument('comments-page-comment.fragment.graphql'),
  getDocument('current-user.query.graphql'),
  getDocument('feed-entry.fragment.graphql'),
  getDocument('feed.query.graphql'),
  getDocument('new-entry.mutation.graphql'),
  getDocument('repo-info.fragment.graphql'),
  getDocument('submit-comment.mutation.graphql'),
  getDocument('vote-buttons.fragment.graphql'),
  getDocument('vote.mutation.graphql'),
]

describe('Graphql-codegen-operations-safelist Plugin', () => {
  let clientOutput: string
  let serverOutput: string

  beforeAll(async () => {
    clientOutput = await plugin(schema, documents, { output: 'client' })
    serverOutput = await plugin(schema, documents, { output: 'server' })
  })

  it('Should generate a valid json file even if a document contains more than one operation', async () => {
    // Check for "Invariant Violation: Ambiguous GraphQL document: contains X operations" error
    const document: Source = {
      document: parse(/* GraphQL */ `
        query CurrentUserForProfile {
          currentUser {
            login
            avatar_url
          }
        }

        query CurrentUserForProfile2 {
          currentUser {
            login
            avatar_url
          }
        }
      `),
    }
    const output = await plugin(schema, [document], { output: 'client' })
    JSON.parse(output)
  })

  describe('Server whitelist', () => {
    it('Should generate a valid json file', async () => {
      expect(serverOutput).toBeDefined()
      JSON.parse(serverOutput)
    })

    it('Should have hashed query as keys', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, ...parsed }: Record<string, string> = JSON.parse(serverOutput)
      const hashes = Object.keys(parsed)
      expect(hashes.length).toBeGreaterThan(0)
      expect(every(hashes, (hash) => hash === hashQuery(parsed[hash]))).toBeTruthy()
    })

    it('Should have operations definitions as values', async () => {
      const parsed: Record<string, string> = JSON.parse(serverOutput)
      const queries = Object.values(parsed)
      expect(queries).toMatchSnapshot()
    })

    it('Should add __typenames', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, ...parsed }: Record<string, string> = JSON.parse(serverOutput)
      const queries = Object.values(parsed)
      expect(queries.length).toBeGreaterThan(0)
      expect(every(queries, (query) => query.includes('__typename'))).toBeTruthy()
    })

    it('Should be able to remove __typenames', async () => {
      const serverOutputWithoutTypenames = await plugin(schema, documents, {
        output: 'server',
        generateTypenames: false,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, ...parsed }: Record<string, string> = JSON.parse(
        serverOutputWithoutTypenames
      )
      const queries = Object.values(parsed)
      expect(queries.length).toBeGreaterThan(0)
      expect(some(queries, (query) => query.includes('__typename'))).toBeFalsy()
    })
  })

  describe('Client whitelist', () => {
    it('Should generate a valid json file', async () => {
      expect(clientOutput).toBeDefined()
      JSON.parse(clientOutput)
    })

    it('Should have queries and mutations name as keys', async () => {
      const parsed: Record<string, string> = JSON.parse(clientOutput)
      const names = Object.keys(parsed)
      expect(names).toMatchSnapshot()
    })

    it('Should have hashes as values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, ...parsed }: Record<string, string> = JSON.parse(clientOutput)
      const names = Object.keys(parsed)
      expect(names.length).toBeGreaterThan(0)
      expect(every(names, (name) => !!parsed[name])).toBeTruthy()
    })
  })

  describe('Client and server files', () => {
    it('Should have same length', async () => {
      const clientParsed = JSON.parse(clientOutput)
      const serverParsed = JSON.parse(serverOutput)
      expect(Object.keys(clientParsed).length).toBeGreaterThan(0)
      expect(Object.keys(clientParsed).length).toBe(Object.keys(serverParsed).length)
    })

    it('Should have hashes in common', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, ...clientParsed } = JSON.parse(clientOutput)
      const serverParsed = JSON.parse(serverOutput)
      const names = Object.keys(clientParsed)
      expect(names.length).toBeGreaterThan(0)
      expect(
        every(names, (name) => {
          const clientHash = clientParsed[name]
          const query = serverParsed[clientHash]
          return clientHash === hashQuery(query)
        })
      ).toBeTruthy()
    })

    it('Should have a default version', async () => {
      const clientParsed = JSON.parse(clientOutput)
      const serverParsed = JSON.parse(serverOutput)
      expect(clientParsed.version).toBe('latest')
      expect(serverParsed.version).toBe('latest')
      expect(clientParsed.version).toBe(serverParsed.version)
    })

    it('Should have a given version', async () => {
      const clientOutputWithCustomVersion = await plugin(schema, documents, {
        output: 'client',
        version: 'v1.0.0',
      })
      const serverOutputWithCustomVersion = await plugin(schema, documents, {
        output: 'server',
        version: 'v1.0.0',
      })
      const clientParsed: Record<string, string> = JSON.parse(clientOutputWithCustomVersion)
      const serverParsed: Record<string, string> = JSON.parse(serverOutputWithCustomVersion)
      expect(clientParsed.version).toBe('v1.0.0')
      expect(serverParsed.version).toBe('v1.0.0')
    })
  })
})
