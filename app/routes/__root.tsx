import { createRootRoute, Outlet } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../globals.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>順番待ちアプリ</title>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
