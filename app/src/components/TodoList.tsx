import type { TodoListQuery } from '../generated/graphql'
import { TodoItem } from './todoItem'

type TodoListProps = {
  todos?: TodoListQuery['todos']
}

export function TodoList({ todos }: TodoListProps) {
  if (todos?.length) {
    return (
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    )
  } else {
    return <p className="emptylist">Your todo list is empty.</p>
  }
}
