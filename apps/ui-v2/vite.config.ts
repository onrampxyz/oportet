import React from '@vitejs/plugin-react'
import Dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import TsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: ['./src/index.ts'],
      formats: ['es'],
    },
    outDir: './dist',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
  },
  plugins: [React(), TsconfigPaths(), Dts()],
})
