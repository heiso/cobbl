# graphql-codegen-operations-safelist &middot; [![Version](https://img.shields.io/npm/v/@cobbl/graphql-codegen-typescript-operations-tester.svg)](https://www.npmjs.com/package/@cobbl/graphql-codegen-typescript-operations-tester) [![Tests](https://github.com/heiso/cobbl/actions/workflows/test.yml/badge.svg)](https://github.com/heiso/cobbl/actions/workflows/tests.yml) [![codecov](https://codecov.io/gh/heiso/cobbl/branch/master/graph/badge.svg?token=kbpSrmmRbC)](https://codecov.io/gh/heiso/cobbl) [![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.dev) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Install

```bash
npm i -D @graphql-codegen/typescript @graphql-codegen/typescript-operations @cobbl/graphql-codegen-typescript-operations-tester
```

## Example

codegen.yml

```yaml
schema: './schema.graphql'
documents: './documents.graphql'

generated/tests.ts:
  plugins:
    - typescript
    - typescript-operations
    - '@cobbl/graphql-codegen-typescript-operations-tester'
  config:
    prefix: test # optional | default 'test'
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

test.spec.ts

```typescript
import { testGetBooksQuery } from './generated/tests.ts'
import { schema } from 'path/to/my/schema'

describe('Test something cool', () => {
  it('testGetBooksQuery should return something', async () => {
    const res = await testGetBooksQuery({ schema }, { var1: 'hello' })
    expect(res.data?.books).toBeAwesome()
  })
})
```
