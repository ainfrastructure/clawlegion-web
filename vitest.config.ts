import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: [
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.tsx',
    ],
    globals: true,
    setupFiles: ['./test-setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.ts',
        'components/**/*.tsx',
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.ts',
      ],
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
