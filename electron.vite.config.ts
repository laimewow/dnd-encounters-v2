import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      // basic-front is a symlinked local `file:` dependency with its own node_modules
      // (react/react-dom/zustand/...) — without dedupe, Vite resolves two separate
      // React copies (ours + basic-front's), which crashes on "Invalid hook call".
      dedupe: ['react', 'react-dom', 'react-router-dom', 'zustand', 'react-i18next', 'i18next', 'react-toastify']
    },
    build: {
      rollupOptions: {
        input: 'src/renderer/index.html'
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { environment: { target: '19' } }]]
        }
      })
    ]
  }
})
