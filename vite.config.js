import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' makes every asset path relative, so the build works both at
// https://user.github.io/repo/ and at the domain root (and even file://).
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5173 }
})
