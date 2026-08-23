import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localIp = env.VITE_LOCAL_IP_ADDRESS;
  const localHostname = env.VITE_LOCAL_HOSTNAME;
  const devPort = Number.parseInt(env.VITE_DEV_PORT, 10);
  const trpcPort = Number.parseInt(env.TRPC_PORT || '3000', 10);

  return {
    plugins: [
      tanstackStart({
        srcDirectory: './app',
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
              console.log('\n  🌐 アクセス可能なURL:');
              console.log(`  ├─ PC:          \x1b[36mhttps://${localHostname}\x1b[0m`);
              console.log(`  └─ スマホ:      \x1b[36mhttps://${localIp}\x1b[0m\n`);
            }, 100);
          });
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: devPort,
      proxy: {
        '/trpc': {
          target: `http://localhost:${trpcPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
