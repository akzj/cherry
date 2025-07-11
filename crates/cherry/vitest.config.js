import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/api/mock/**/*.test.ts'],
    setupFiles: ['./src/api/mock/data/setup-localstorage.ts'],
  },
});
