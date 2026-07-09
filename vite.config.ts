import { defineConfig, type Plugin } from 'vite'
import { resolve } from 'path'

// Minifies HTML template literals (post-build). CSS wird nicht mehr hier
// behandelt — es liegt in src/widget.css und wird via `?inline` durch Vites
// CSS-Pipeline (inkl. Minification in prod) als String eingebettet.
function minifyTemplates(): Plugin {
  return {
    name: 'minify-templates',
    apply: 'build',

    // Post-build: after the JS has been minified, only template literal
    // contents still have newlines. Collapse those here.
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
          chunk.code = chunk.code
            .replace(/\n\s{2,}/g, '')     // indentation newlines inside templates
            .replace(/>\s+</g, '><')      // space between HTML tags
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [minifyTemplates()],
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
