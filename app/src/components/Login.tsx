import { gql } from '@apollo/client'
import { useState } from 'react'
import { useLoginMutation } from '../generated/graphql'

gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, loginMutation] = useLoginMutation()

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        if (!loginMutation.loading) {
          const { data } = await login({ variables: { email, password } })
          if (data?.login) {
            await loginMutation.client.resetStore()
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
