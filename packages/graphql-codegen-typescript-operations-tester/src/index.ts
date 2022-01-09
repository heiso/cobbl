import { FragmentMap, getFragmentFromOperation } from '@cobl/graphql-codegen-core'
import { PluginFunction } from '@graphql-codegen/plugin-helpers'
import { pascalCase } from 'change-case-all'
import { concatAST, DocumentNode, Kind, print, visit } from 'graphql'

type Config = {
  prefix?: string
}

const defaultConfig = {
  prefix: 'test',
}

export const plugin: PluginFunction<Config> = (schema, sources, config) => {
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

  const lines: string[] = []

  visit(documentNode, {
    OperationDefinition: {
      enter(node) {
        if (!node.name) {
          throw new Error(
            `All graphql operation definitions should have a unique name: \n ${print(node)}`
          )
        }

        const type = node.operation === 'mutation' ? 'Mutation' : 'Query'

        // Mimic the default naming convention.
        // See https://www.graphql-code-generator.com/docs/getting-started/naming-convention#namingconvention
        const name = pascalCase(`${node.name.value}${type}`)

        const operationFragments = getFragmentFromOperation(node, fragmentMap)
        const query = `${operationFragments.map(print)}${print(node)}`

        lines.push(``)
        lines.push(`export const ${name}Source = \``)
        lines.push(`${query}\`;`)
        lines.push(``)
        lines.push(`export function ${config.prefix}${name}(`)
        lines.push(`  graphqlArgs: Partial<GraphQLArgs> & Pick<GraphQLArgs, 'schema'>,`)
        lines.push(`  variables?: ${name}Variables`)
        lines.push(`) {`)
        lines.push(
          `  return graphql({ ...graphqlArgs, source: ${name}Source, variableValues: variables }) as Promise<ExecutionResult<${name}>>`
        )
        lines.push(`};`)
      },
    },
  })

  return {
    prepend: [`import { graphql, ExecutionResult, GraphQLArgs } from 'graphql'`],
    content: lines.join('\n'),
  }
}
