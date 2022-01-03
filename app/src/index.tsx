import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'urql'
import App from './App'
import { client } from './core/graphql-client'
import reportWebVitals from './core/reportWebVitals'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
