import react from '@vitejs/plugin-react';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import { extname, relative, resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [react(), libInjectCss(), dts({ include: ['lib'] })],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // или "modern"
      }
    }
  },
  resolve: {
    alias: {
      lib: resolve(__dirname, 'lib')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'jotai',
        'classnames',
        'fast-deep-equal',
        'jotai',
        'react-dom',
        'svg-points'
      ],
      input: Object.fromEntries(
        glob
          .sync('lib/**/*.{ts,tsx}')
          .map((file) => [
            relative('lib', file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url))
          ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  }
});
