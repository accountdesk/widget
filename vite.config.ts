import { defineConfig, type Plugin } from 'vite'
import { resolve } from 'path'

// Minifies CSS (pre-build) and HTML template literals (post-build).
function minifyTemplates(): Plugin {
  return {
    name: 'minify-templates',
    apply: 'build',

    // Pre-build: minify the CSS block (marked with /* css */)
    transform(code, id) {
      if (!id.endsWith('.ts')) return
      code = code.replace(
        /\/\* css \*\/\s*`([\s\S]*?)`/g,
        (_match, css: string) => {
          const minified = css
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s*\n\s*/g, '')
            .replace(/\s*([{}:;,>~+])\s*/g, '$1')
            .replace(/;}/g, '}')
            .trim()
          return '`' + minified + '`'
        },
      )
      return { code, map: null }
    },

    // Post-build: after esbuild has minified JS, only template literal
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
