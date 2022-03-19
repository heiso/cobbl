import { json, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { gql } from 'graphql-tag'
import { sdk } from '../core/graphql'
import { ErrorCode } from '../generated/graphql'

gql`
  mutation AddTodo($label: String!) {
    addTodo(label: $label) {
      ...TodoItemForTodo
    }
  }
`

export async function handleAddTodo(form: FormData, request: Request) {
  const label = form.get('label')

  console.log(form.get('label'))

  if (typeof label !== 'string') {
    return json(null, { status: 400 })
  }

  const { errors, extensions } = await sdk.AddTodo({ label }, { request })

  if (errors?.some(({ message }) => message === ErrorCode.UNAUTHENTICATED)) {
    return redirect('/login', { headers: extensions?.headers })
  }

  if (errors?.length) {
    throw errors
  }

  return json(null, { headers: extensions?.headers })
}

export function TodoInput() {
  return (
    <Form className="form" method="post">
      <input type="hidden" name="mutation" value="AddTodo" />
      <label htmlFor="label">Add to the todo list</label>
      <input name="label" type="text" />
      <button type="submit">Add item</button>
    </Form>
  )
}
