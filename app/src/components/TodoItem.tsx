import { gql } from '@apollo/client'
import {
  TodoItemForTodoFragment,
  useRemoveTodoMutation,
  useUpdateTodoMutation,
} from '../generated/graphql'

gql`
  fragment TodoItemForTodo on Todo {
    id
    label
    isCompleted
  }

  mutation UpdateTodo($input: TodoInput!) {
    updateTodo(input: $input) {
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

export function TodoItem({ todo }: TodoItemProps) {
  const [updatetodo, updatetodoMutation] = useUpdateTodoMutation()

  const [removeTodo, removeTodoMutation] = useRemoveTodoMutation({
    variables: { id: todo.id },
    /**
     * @todo find a way to type this
     */
    updateQueries: {
      TodoList: (previousData, { mutationResult }) => {
        if (!mutationResult.data) return previousData

        return {
          todos: previousData.todos.filter((previousTodo) => previousTodo.id !== todo.id),
        }
      },
    },
  })

  return (
    <li key={todo.id} className={todo.isCompleted ? 'done' : ''}>
      <span className="label">{todo.label}</span>
      <div className="actions">
        <button
          className="btn-picto"
          type="button"
          onClick={async (event) => {
            event.preventDefault()
            if (!updatetodoMutation.loading) {
              await updatetodo({
                variables: {
                  input: { id: todo.id, label: todo.label, isCompleted: !todo.isCompleted },
                },
              })
            }
          }}
        >
          <i className="material-icons">
            {todo.isCompleted ? 'check_box' : 'check_box_outline_blank'}
          </i>
        </button>
        <button
          className="btn-picto"
          type="button"
          onClick={async (event) => {
            event.preventDefault()
            if (!removeTodoMutation.loading) {
              await removeTodo()
            }
          }}
        >
          <i className="material-icons">delete</i>
        </button>
      </div>
    </li>
  )
}
