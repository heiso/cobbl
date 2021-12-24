import {
  FragmentDefinitionNode,
  InlineFragmentNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  visit,
} from 'graphql'

export type FragmentMap = Record<string, FragmentDefinitionNode>

function getFragmentFromSelection(selection: SelectionNode, fragmentMap: FragmentMap) {
  if (selection.kind === Kind.INLINE_FRAGMENT) {
    return selection
  } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
    return fragmentMap && fragmentMap[selection.name.value]
  } else {
    return null
  }
}

export function getFragmentFromOperation(
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
