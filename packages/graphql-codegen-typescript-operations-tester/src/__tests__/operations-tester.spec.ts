import { Source } from '@graphql-tools/utils'
import { readFileSync } from 'fs'
import { buildClientSchema, parse } from 'graphql'
import { join, resolve } from 'path'
import { plugin } from '..'

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

describe('Graphql-codegen-operations-tester Plugin', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let output: any

  beforeAll(async () => {
    output = await plugin(schema, documents, {})
  })

  it('should have prepend property', async () => {
    expect(output).toHaveProperty('prepend')
  })

  it('should have content property', async () => {
    expect(output).toHaveProperty('content')
  })

  describe('content', () => {
    it('should match snapshot', async () => {
      expect(output.content).toMatchSnapshot()
    })
  })
})
