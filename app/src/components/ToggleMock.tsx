import { makeVar, useApolloClient, useReactiveVar } from '@apollo/client'
import React from 'react'

export const isMockEnabled = makeVar<boolean>(false)

export function ToggleMock() {
  const mock = useReactiveVar(isMockEnabled)
  const client = useApolloClient()

  return (
    <p className="mock-btn">
      <button
        onClick={async () => {
          isMockEnabled(!mock)
          await client.resetStore()
        }}
      >
        {mock ? 'Disable mocks' : 'Enable mocks'}
      </button>
    </p>
  )
}
