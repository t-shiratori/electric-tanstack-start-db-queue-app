import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localIp = env.LOCAL_IP_ADDRESS
  const localHostname = env.VITE_LOCAL_HOSTNAME
  const devPort = parseInt(env.VITE_DEV_PORT, 10)

  return {
    plugins: [
      tanstackStart({
        srcDirectory: './app',
      }),
      tanstackRouter({
        generatedRouteTree: './app/routeTree.gen.ts',
        routesDirectory: './app/routes',
      }),
      react(),
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      {
        name: 'custom-server-ready',
        configureServer(server) {
          server.httpServer?.once('listening', () => {
            setTimeout(() => {
              console.log('\n  🌐 アクセス可能なURL:')
              console.log(`  ├─ PC:          \x1b[36mhttps://${localHostname}\x1b[0m`)
              console.log(`  └─ スマホ:      \x1b[36mhttps://${localIp}\x1b[0m\n`)
            }, 100)
          })
        },
      },
    ],
    server: {
      host: '0.0.0.0', // すべてのネットワークインターフェースでリッスン（スマホからアクセス可能）
      port: devPort,
    },
  }
})
