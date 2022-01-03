import React from 'react'
import { gql } from 'urql'
import { useAccountQuery } from '../generated/graphql'
import { Login } from './Login'

gql`
  fragment AccountForAuth on Account {
    id
    email
  }

  query Account {
    account {
      ...AccountForAuth
    }
  }
`

type AuthProps = {
  children: React.ReactElement
}

export function Auth({ children }: AuthProps) {
  const [{ data, fetching }] = useAccountQuery()

  if (fetching) {
    return null
  } else if (data?.account) {
    return children
  } else {
    return <Login />
  }
}
