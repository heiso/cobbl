import { devtoolsExchange } from '@urql/devtools'
import { cacheExchange } from '@urql/exchange-graphcache'
import { createClient, dedupExchange, fetchExchange } from 'urql'
import { GraphCacheConfig } from '../generated/graphql'

// const mockLink = new ApolloLink((operation, forward) => {
//   operation.setContext({
//     http: {
//       includeExtensions: true,
//     },
//   })

//   operation.extensions.mock = isMockEnabled()

//   return forward(operation)
// })

// const safelistLink = new ApolloLink((operation, forward) => {
//   if (!forward) {
//     throw new Error('safelistLink cannot be the last link in the chain.')
//   }

//   if (!safelist[operation.operationName]) {
//     throw new Error('operation not found in given safelist.')
//   }

//   if (!safelist.version) {
//     throw new Error('version not found in given safelist.')
//   }

//   operation.setContext({
//     http: {
//       includeQuery: false,
//       includeExtensions: true,
//     },
//   })

//   operation.extensions.safelist = {
//     version: safelist.version,
//     hash: safelist[operation.operationName],
//   }

//   return forward(operation)
// })

// export const client = new ApolloClient({
//   cache: new InMemoryCache({
//     typePolicies: {} as TypedTypePolicies,
//     possibleTypes: fragments.possibleTypes,
//   }),
//   link: ApolloLink.from([mockLink, safelistLink, httpLink]),
// })

export const client = createClient({
  url: 'http://localhost:3000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange<GraphCacheConfig>({
      // schema,
      // updates: {
      //   Mutation: {
      //     login: (result, args, cache, info) => {
      //       cache.updateQuery({ query: AccountDocument }, () => {
      //         return result.login
      //       })
      //     },
      //   },
      // },
    }),
    fetchExchange,
  ],
})
