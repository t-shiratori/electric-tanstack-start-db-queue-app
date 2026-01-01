import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      generatedRouteTree: './app/routeTree.gen.ts',
      routesDirectory: './app/routes',
    }),
    react(),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
})
