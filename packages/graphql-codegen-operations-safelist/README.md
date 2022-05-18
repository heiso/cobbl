# graphql-codegen-operations-safelist &middot; [![Version](https://img.shields.io/npm/v/@cobbl/graphql-codegen-operations-safelist.svg)](https://www.npmjs.com/package/@cobbl/graphql-codegen-operations-safelist) [![Tests](https://github.com/heiso/cobbl/actions/workflows/test.yml/badge.svg)](https://github.com/heiso/cobbl/actions/workflows/tests.yml) [![codecov](https://codecov.io/gh/heiso/cobbl/branch/master/graph/badge.svg?token=kbpSrmmRbC)](https://codecov.io/gh/heiso/cobbl) [![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.dev) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Install

```bash
npm i -D @cobbl/graphql-codegen-operations-safelist
```

## Example

codegen.yml

```yaml
schema: './schema.graphql'
documents: './documents.graphql'

generated/client-safelist.json:
  plugins:
    - '@cobbl/graphql-codegen-operations-safelist'
  config:
    output: client
    # version: v1.2.3

generated/server-safelist.json:
  plugins:
    - '@cobbl/graphql-codegen-operations-safelist'
  config:
    output: server
    # version: v1.2.3
```

schema.graphql

```graphql
type Author {
  firstname: String
  lastname: String
  fullname: String
}

type Book {
  title: String
  author: Author
}

type Query {
  books: [Book]
}
```

documents.graphql

```graphql
query getBooks($var1: String!) {
  books(var1: $var1) {
    title
    author {
      firstname
      lastname
      fullname
    }
  }
}
```

Somewhere in your client before sending graphql operation to server (example with apollo-client)

```typescript
import safelist from 'generated/client-safelist.json'

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
      includeQuery: false, // <- Important
      includeExtensions: true, // <- Important
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
  // [...]
  link: ApolloLink.from([safelistLink, httpLink]),
})
```

Somewhere in a middleware BEFORE graphql (example with koa and no version management)

```typescript
import safelist from 'generated/server-safelist.json'

const simpleGraphqlSafelistMiddleware: Middleware = (ctx, next) => {
  const hash = ctx.request.body?.extensions?.safelist?.hash

  if (!hash) {
    ctx.throw(403, 'FORBIDDEN')
  }

  const query = safelist[hash]

  if (!query) {
    ctx.throw(403, 'FORBIDDEN')
  }

  ctx.request.body.query = query
}
```

## License

[MIT](./LICENSE)
