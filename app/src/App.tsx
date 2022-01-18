import React from 'react'
import { Auth } from './components/Auth'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'

function App() {
  return (
    <div>
      <main>
        <h1>Todo List</h1>

        <Auth>
          <div>
            <TodoList />
            <TodoInput />
          </div>
        </Auth>
      </main>
      {/* <ToggleMock /> */}
    </div>
  )
}

export default App
