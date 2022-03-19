import type { DocumentNode, ExecutionResult } from 'graphql'
import { print, visit } from 'graphql'
import type { Requester } from '../generated/graphql'
import { getSdk } from '../generated/graphql'
import safelist from '../generated/safelist.json'

type Options = {
  request: Request
}

type Extensions = {
  headers?: Request['headers']
}

const requester: Requester<Options, Extensions> = async <TResult, TVariables>(
  documentNode: DocumentNode,
  variables: TVariables,
  options?: Options
): Promise<ExecutionResult<TResult, Extensions>> => {
  let operationName: string | undefined

  visit(documentNode, {
    OperationDefinition: {
      enter(node) {
        operationName = node.name?.value
      },
    },
  })

  if (!operationName) {
    throw new Error(
      `All graphql operation definitions should have a unique name: \n ${print(documentNode)}`
    )
  }

  const requestCookieHeader = options?.request?.headers.get('cookie')

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(requestCookieHeader && { Cookie: requestCookieHeader }),
    },
    body: JSON.stringify({
      operationName,
      variables,
      extensions: {
        mock: options?.request.url && new URL(options?.request.url).searchParams.has('mock'),
        safelist: {
          version: safelist.version,
          hash: safelist[operationName],
        },
      },
    }),
  })

  const responseSetCookieHeader = response.headers.get('set-cookie')
  const json = (await response.json()) as ExecutionResult<TResult, Extensions>

  if (responseSetCookieHeader) {
    json.extensions = {
      ...json.extensions,
      headers: new Headers({ 'set-cookie': responseSetCookieHeader }),
    }
  }

  return json
}

export const sdk = getSdk(requester)
