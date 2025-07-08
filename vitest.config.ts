import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      'context/**', // Exclude the context/typescript-sdk tests (they use Jest)
      '**/*.d.ts'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'context/',
        '**/*.d.ts',
        '**/*.test.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}); 