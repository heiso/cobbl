import React from 'react'
import { gql } from 'urql'
import { useTodoListQuery } from '../generated/graphql'
import { TodoItem } from './TodoItem'

gql`
  query TodoList {
    todos {
      ...TodoItemForTodo
    }
  }
`

export function TodoList() {
  const [{ data, fetching }] = useTodoListQuery()

  if (fetching) {
    return null
  } else if (data?.todos.length) {
    return <ul>{data && data.todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}</ul>
  } else {
    return <p className="emptylist">Your todo list is empty.</p>
  }
}
