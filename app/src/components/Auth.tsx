import { gql } from '@apollo/client'
import React from 'react'
import { useAccountQuery } from '../generated/graphql'
import { Login } from './Login'

gql`
  query Account {
    account {
      id
      email
    }
  }
`

type AuthProps = {
  children: React.ReactElement
}

export function Auth({ children }: AuthProps) {
  const { data, loading, called } = useAccountQuery()

  if (loading || !called) {
    return null
  } else if (data?.account) {
    return children
  } else {
    return <Login />
  }
}
