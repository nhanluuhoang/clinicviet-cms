import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_APP_API_URL
  const localApi =
    /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/.test(
      apiUrl ?? ''
    )
  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: localApi
        ? {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
              rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
