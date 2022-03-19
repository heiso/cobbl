import type { ActionFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { gql } from 'graphql-request'
import { sdk } from '../core/graphql'
import { ErrorCode } from '../generated/graphql'

gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email')
  const password = form.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return json(null, { status: 400 })
  }

  const { data, errors, extensions } = await sdk.Login({ email, password }, { request })

  if (errors?.some(({ message }) => message === ErrorCode.UNAUTHENTICATED)) {
    return redirect('/login', { headers: extensions?.headers })
  }

  if (errors?.length) {
    throw errors
  }

  if (data && data.login) {
    return redirect('/', { headers: extensions?.headers })
  }

  return json(null, { headers: extensions?.headers, status: 500 })
}

export default function Login() {
  return (
    <Form className="form" method="post">
      <label htmlFor="email">Email</label>
      <input name="email" type="text" />
      <label htmlFor="password">Password</label>
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </Form>
  )
}
