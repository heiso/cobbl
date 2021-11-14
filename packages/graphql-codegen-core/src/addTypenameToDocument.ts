import { DocumentNode, FieldNode, Kind, OperationDefinitionNode, visit } from 'graphql'

/**
 * Copied from @apollo/client/utilities
 * https://github.com/apollographql/apollo-client/blob/212b1e686359a3489b48d7e5d38a256312f81fde/src/utilities/graphql/transform.ts#L55
 */
const TYPENAME_FIELD: FieldNode = {
  kind: Kind.FIELD,
  name: {
    kind: Kind.NAME,
    value: '__typename',
  },
}

/**
 * Copied from @apollo/client/utilities WITHOUT the call to checkDocument that fails if an operation contains more than one query or mutation
 * https://github.com/apollographql/apollo-client/blob/212b1e686359a3489b48d7e5d38a256312f81fde/src/utilities/graphql/transform.ts#L213
 */
export function addTypenameToDocument(document: DocumentNode): DocumentNode {
  return visit(document, {
    SelectionSet: {
      enter(node, _key, parent) {
        // Don't add __typename to OperationDefinitions.
        if (parent && (parent as OperationDefinitionNode).kind === 'OperationDefinition') {
          return undefined
        }

        // No changes if no selections.
        const { selections } = node
        if (!selections) {
          return undefined
        }

        // If selections already have a __typename, or are part of an
        // introspection query, do nothing.
        const skip = selections.some((selection) => {
          return (
            selection.kind === Kind.FIELD &&
            (selection.name.value === '__typename' ||
              selection.name.value.lastIndexOf('__', 0) === 0)
          )
        })
        if (skip) {
          return undefined
        }

        // If this SelectionSet is @export-ed as an input variable, it should
        // not have a __typename field (see issue #4691).
        const field = parent as FieldNode
        if (
          field.kind === Kind.FIELD &&
          field.directives &&
          field.directives.some((d) => d.name.value === 'export')
        ) {
          return undefined
        }

        // Create and return a new SelectionSet with a __typename Field.
        return {
          ...node,
          selections: [...selections, TYPENAME_FIELD],
        }
      },
    },
  })
}
