/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // react-native-web missing InputAccessoryView — use shim that adds it
      'react-native': path.resolve(dirname, 'src/stubs/react-native-shim.js'),
      'react-native-svg': path.resolve(dirname, 'src/stubs/react-native-svg.js')
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['react-native-web', 'use-sync-external-store/shim']
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          globals: true,
          include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
        }
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ]
  }
});