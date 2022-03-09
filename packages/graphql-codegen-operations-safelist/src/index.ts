import {
  addTypenameToDocument,
  FragmentMap,
  getFragmentFromOperation,
} from '@cobbl/graphql-codegen-core'
import { PluginFunction, PluginValidateFn } from '@graphql-codegen/plugin-helpers'
import { createHash } from 'crypto'
import { concatAST, DocumentNode, Kind, print, visit } from 'graphql'
import { extname } from 'path'

export type PluginConfig = {
  /**
   * @description Define which type of file will be generated, hashes by name (client), or queries by hash (server)
   */
  output: 'server' | 'client'
  /**
   * @description Keeping in mind that you probably don't totally control what version of your client is up in the woods, your server should be able to answer to at least some old client and therefore some old safelists.
   * If you set a version, the server could get the correct safelist.
   * @default "latest"
   */
  version?: string
  /**
   * @description Include __typename on each selection (apollo client actually use it to handle cache)
   * @default true
   */
  generateTypenames?: boolean
}

const defaultConfig = {
  version: 'latest',
  generateTypenames: true,
}

export function hashQuery(query: string) {
  return createHash('sha256').update(query, 'utf8').digest().toString('hex')
}

export const plugin: PluginFunction<PluginConfig, string> = (schema, sources, config) => {
  config = { ...defaultConfig, ...config }

  const documentNodes = sources.reduce<DocumentNode[]>((acc, document) => {
    if (document.document) {
      acc.push(document.document)
    }
    return acc
  }, [])
  const documentNode = concatAST(documentNodes)
  const fragmentMap = documentNode.definitions.reduce<FragmentMap>((acc, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      acc[definition.name.value] = definition
    }
    return acc
  }, {})

  const operations: Record<string, string> = {}

  documentNodes.forEach((documentNode) => {
    visit(config.generateTypenames ? addTypenameToDocument(documentNode) : documentNode, {
      OperationDefinition: {
        enter(node) {
          if (!node.name) {
            throw new Error(
              `All graphql operation definitions should have a unique name: \n ${print(node)}`
            )
          }

          const operationFragments = getFragmentFromOperation(node, fragmentMap)
          const query = `${operationFragments.map(print)}${print(node)}`
          const hash = hashQuery(query)

          if (config.output === 'client') {
            operations[node.name.value] = hash
          } else {
            operations[hash] = query
          }
        },
      },
    })
  })

  return JSON.stringify({ ...operations, version: config.version }, null, '  ')
}

export const validate: PluginValidateFn<PluginConfig> = (schema, sources, config, outputFile) => {
  if (!config.output) {
    throw new Error(`'output' should be defined in config, possibles values are 'server | 'client'`)
  }

  if (extname(outputFile) !== '.json') {
    throw new Error(`Plugin requires extension to be ".json"!`)
  }

  if (!config.version) {
    console.warn(
      `Warning, if you'r planning to deploy this safelist, you should definitively define a 'version' in config`
    )
  }
}
