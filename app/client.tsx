import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { createRouter } from './router'
import { initElectricSync } from './db'

const router = createRouter()

function App() {
  useEffect(() => {
    // Initialize ElectricSQL sync on app mount
    const unsubscribe = initElectricSync()

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  return <RouterProvider router={router} />
}

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
