import { gql } from '@apollo/client'
import React from 'react'
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
  const { data, loading } = useTodoListQuery()

  if (loading) {
    return null
  } else if (data?.todos.length) {
    return <ul>{data && data.todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}</ul>
  } else {
    return <p className="emptylist">Your todo list is empty.</p>
  }
}
