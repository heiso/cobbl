import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { isMockEnabled } from '../components/ToggleMock'
import fragments from '../generated/fragments.json'
import { TypedTypePolicies } from '../generated/graphql'
import safelist from '../generated/safelist.json'

const mockLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    http: {
      includeExtensions: true,
    },
  })

  operation.extensions.mock = isMockEnabled()

  return forward(operation)
})

const safelistLink = new ApolloLink((operation, forward) => {
  if (!forward) {
    throw new Error('safelistLink cannot be the last link in the chain.')
  }

  if (!safelist[operation.operationName]) {
    throw new Error('operation not found in given safelist.')
  }

  if (!safelist.version) {
    throw new Error('version not found in given safelist.')
  }

  operation.setContext({
    http: {
      includeQuery: false,
      includeExtensions: true,
    },
  })

  operation.extensions.safelist = {
    version: safelist.version,
    hash: safelist[operation.operationName],
  }

  return forward(operation)
})

const httpLink = new HttpLink({
  uri: `http://localhost:3000/graphql`,
  credentials: 'include',
})

export const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {} as TypedTypePolicies,
    possibleTypes: fragments.possibleTypes,
  }),
  link: ApolloLink.from([mockLink, safelistLink, httpLink]),
})
