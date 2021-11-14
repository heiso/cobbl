import {
  createFragmentMap,
  FragmentMap,
  getFragmentDefinitions,
  getFragmentFromSelection,
} from '@apollo/client/utilities'
import { PluginFunction, PluginValidateFn } from '@graphql-codegen/plugin-helpers'
import { addTypenameToDocument } from '@graphql-example/graphql-codegen-core'
import { createHash } from 'crypto'
import {
  concatAST,
  DocumentNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql'
import { extname } from 'path'

export type WhitelistPluginConfig = {
  /**
   * @description Define which type of file will be generated, hashes by name (client), or queries by hash (server)
   */
  output: 'server' | 'client'
  /**
   * @description Keeping in mind that you probably don't totally control what version of your client is up in the woods, your server should be able to answer to at least some old client and therefore some old whitelists.
   * If you set a version, the server could get the correct whitelist.
   * @default "latest"
   */
  version?: string
  /**
   * @description Include __typename on each selection (apollo client actually use it to handle cache)
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.json:
   *     documents: path/to/documents.graphql
   *     plugins:
   *       - operations-whitelist
   *     config:
   *       output: client
   *       generateTypenames: false
   * ```
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

function getFragmentFromOperation(
  node: OperationDefinitionNode | FragmentDefinitionNode | InlineFragmentNode,
  fragmentMap: FragmentMap,
  operationFragments: Record<string, FragmentDefinitionNode | InlineFragmentNode> = {}
) {
  visit(node, {
    FragmentSpread: {
      enter(node) {
        const fragment = getFragmentFromSelection(node, fragmentMap)
        if (fragment) {
          operationFragments[node.name.value] = fragment
          getFragmentFromOperation(fragment, fragmentMap, operationFragments)
        } else {
          throw new Error(`Unknown fragment: ${node.name.value}`)
        }
      },
    },
  })

  return Object.values(operationFragments)
}

export const plugin: PluginFunction<WhitelistPluginConfig, string> = (
  schema,
  documents,
  config
) => {
  config = { ...defaultConfig, ...config }

  const documentNodes = documents.reduce<DocumentNode[]>(
    (acc, document) => (!!document.document ? [...acc, document.document] : acc),
    []
  )

  const fragments = getFragmentDefinitions(concatAST(documentNodes))
  const fragmentMap = createFragmentMap(fragments)

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

export const validate: PluginValidateFn<WhitelistPluginConfig> = (
  schema,
  documents,
  config,
  outputFile
) => {
  if (!config.output) {
    throw new Error(`'output' should be defined in config, possibles values are 'server | 'client'`)
  }

  if (extname(outputFile) !== '.json') {
    throw new Error(`Plugin "operations-whitelist" requires extension to be ".json"!`)
  }

  if (!config.version) {
    console.warn(
      `Warning, if you'r planning to deploy this whitelist, you should definitively define a 'version' in config`
    )
  }
}
