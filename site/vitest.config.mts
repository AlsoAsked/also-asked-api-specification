import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: './tests',
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['plugins/**', 'scripts/lib/**', 'src/remark/**'],
    },
  },
});
