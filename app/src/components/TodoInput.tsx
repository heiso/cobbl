import { gql } from '@apollo/client'
import React from 'react'
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
  const [addTodo, addTodoMutation] = useAddTodoMutation({
    /**
     * @todo find a way to type this
     * Maybe use merge methods defined in apolloclient
     * node_modules/@apollo/client/core/types.d.ts L.48 and L.53
     */
    updateQueries: {
      TodoList: (previousData, { mutationResult }) => {
        if (!mutationResult.data) return previousData

        return {
          todos: [...previousData.todos, mutationResult.data.addTodo],
        }
      },
    },
  })

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        if (!addTodoMutation.loading && label != '') {
          setLabel('')
          await addTodo({ variables: { label } })
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
