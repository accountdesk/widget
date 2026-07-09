import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AccountdeskWidget',
      formats: ['iife'],
      fileName: () => 'accountdesk-widget.js',
    },
    // Widely-available Baseline (Vite-Default ab v7) — explizit für ein
    // vorhersehbares Bundle-Target auf Kundenseiten.
    target: 'baseline-widely-available',
    // Vite 8 ist rolldown-basiert (kein esbuild mehr) — Default-Minifier (oxc).
    minify: true,
    outDir: process.env.WIDGET_OUT_DIR ?? 'dist',
    emptyOutDir: false,
  },
  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
