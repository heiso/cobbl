import type { ErrorBoundaryComponent, LinksFunction, MetaFunction } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import styles from './index.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Todo List',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Quicksand' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
]

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        errors : {error}
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <main>
            <h1>Todo List</h1>
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
