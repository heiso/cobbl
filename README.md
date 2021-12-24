# Graphql-example

[![Tests](https://github.com/heiso/graphql-example/actions/workflows/test.yml/badge.svg)](https://github.com/heiso/graphql-example/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/heiso/graphql-example/branch/main/graph/badge.svg?token=QVNB8JCBJS)](https://codecov.io/gh/heiso/graphql-example)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.dev)

## Install and first run

```bash
npm i
npm run build:packages
npm run prisma generate
npm run codegen
npm run up
npm run reset-database
```

Then go to http://localhost:3000

## Stop and start

`npm run up` and `npm run down`

## Test for fun

```bash
npm run test
```

## License

[MIT](./LICENSE)
