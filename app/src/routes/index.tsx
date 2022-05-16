import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-tag'
import { handleAddTodo, TodoInput } from '../components/todoInput'
import { handleRemoveTodo, handleSetTodoIsCompleted } from '../components/todoItem'
import { TodoList } from '../components/todoList'
import { sdk } from '../core/graphql'
import type { TodoListQuery } from '../generated/graphql'
import { ErrorCode } from '../generated/graphql'

gql`
  query TodoList {
    todos {
      ...TodoItemForTodo
    }
  }
`

export const loader: LoaderFunction = async ({ request }) => {
  const { data, errors, extensions } = await sdk.TodoList({}, { request })

  if (errors?.some(({ message }) => message === ErrorCode.UNAUTHENTICATED)) {
    return redirect('/login', { headers: extensions?.headers })
  }

  if (errors?.length) {
    throw errors
  }

  if (data) {
    return json(data, { headers: extensions?.headers })
  }

  return json(null, { headers: extensions?.headers, status: 500 })
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const mutation = form.get('mutation')

  switch (mutation) {
    case 'AddTodo':
      return handleAddTodo(form, request)

    case 'SetTodoIsCompleted':
      return handleSetTodoIsCompleted(form, request)

    case 'RemoveTodo':
      return handleRemoveTodo(form, request)

    default:
      return json(null, { status: 404 })
  }
}

export default function Index() {
  const { todos } = useLoaderData<TodoListQuery>()

  return (
    <>
      <TodoList todos={todos} />
      <TodoInput />
    </>
  )
}
