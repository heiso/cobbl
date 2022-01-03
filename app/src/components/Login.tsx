import React, { useState } from 'react'
import { gql } from 'urql'
import { useLoginMutation } from '../generated/graphql'

gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ...AccountForAuth
    }
  }
`

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginResult, login] = useLoginMutation()

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        if (!loginResult.fetching) {
          const { data } = await login({ email, password })
          if (data?.login) {
            /**
             * @todo reset local store
             */
            // await loginResult.
          }
        }
      }}
    >
      <label htmlFor="email">Email</label>
      <input name="email" type="text" onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label>
      <input
        name="password"
        type="password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  )
}
