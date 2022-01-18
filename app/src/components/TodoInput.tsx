import React from 'react'
import { gql } from 'urql'
import { useAddTodoMutation } from '../generated/graphql'

gql`
  mutation AddTodo($label: String!) {
    addTodo(label: $label) {
      ...TodoItemForTodo
    }
  }
`

export function TodoInput() {
  const [label, setLabel] = React.useState<string>('')
  /**
   * @todo fix cache
   */
  // {
  //   updateQueries: {
  //     TodoList: (previousData, { mutationResult }) => {
  //       if (!mutationResult.data) return previousData

  //       return {
  //         todos: [...previousData.todos, mutationResult.data.addTodo],
  //       }
  //     },
  //   },
  // }
  const [addTodoResult, addTodo] = useAddTodoMutation()

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        if (!addTodoResult.fetching && label != '') {
          setLabel('')
          await addTodo({ label })
        }
      }}
    >
      <label htmlFor="newitem">Add to the todo list</label>
      <input
        type="text"
        id="newitem"
        onChange={(event) => setLabel(event.target.value)}
        value={label}
      />
      <button type="submit">Add item</button>
    </form>
  )
}
