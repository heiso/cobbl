import { json, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { gql } from 'graphql-tag'
import { sdk } from '../core/graphql'
import type { TodoItemForTodoFragment } from '../generated/graphql'
import { ErrorCode } from '../generated/graphql'

gql`
  fragment TodoItemForTodo on Todo {
    id
    label
    isCompleted
  }

  mutation SetTodoIsCompleted($id: ID!, $isCompleted: Boolean!) {
    setTodoIsCompleted(id: $id, isCompleted: $isCompleted) {
      ...TodoItemForTodo
    }
  }

  mutation RemoveTodo($id: ID!) {
    removeTodo(id: $id)
  }
`

type TodoItemProps = {
  todo: TodoItemForTodoFragment
}

export async function handleSetTodoIsCompleted(form: FormData, request: Request) {
  const id = form.get('id')
  const isCompleted = form.get('isCompleted')

  if (typeof id !== 'string') {
    return json(null, { status: 400 })
  }

  const { errors, extensions } = await sdk.SetTodoIsCompleted(
    { id, isCompleted: Boolean(Number(isCompleted)) },
    { request }
  )

  if (errors?.some(({ message }) => message === ErrorCode.UNAUTHENTICATED)) {
    return redirect('/login', { headers: extensions?.headers })
  }

  if (errors?.length) {
    throw errors
  }

  return json(null, { headers: extensions?.headers })
}

export async function handleRemoveTodo(form: FormData, request: Request) {
  const id = form.get('id')

  if (!id || typeof id !== 'string') {
    return json(null, { status: 500 })
  }

  const { errors, extensions } = await sdk.RemoveTodo({ id }, { request })

  if (errors?.some(({ message }) => message === ErrorCode.UNAUTHENTICATED)) {
    return redirect('/login', { headers: extensions?.headers })
  }

  if (errors?.length) {
    throw errors
  }

  return json(null, { headers: extensions?.headers })
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li key={todo.id} className={todo.isCompleted ? 'done' : ''}>
      <span className="label">{todo.label}</span>
      <div className="actions">
        <Form method="post">
          <input type="hidden" name="mutation" value="SetTodoIsCompleted" />
          <input type="hidden" name="id" value={todo.id} />
          <input type="hidden" name="isCompleted" value={Number(!todo.isCompleted)} />
          <button className="btn-picto" type="submit">
            <i className="material-icons">
              {todo.isCompleted ? 'check_box' : 'check_box_outline_blank'}
            </i>
          </button>
        </Form>

        <Form method="post">
          <input type="hidden" name="mutation" value="RemoveTodo" />
          <input type="hidden" name="id" value={todo.id} />
          <button className="btn-picto" type="submit">
            <i className="material-icons">delete</i>
          </button>
        </Form>
      </div>
    </li>
  )
}
