import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: /^quasar$/, replacement: 'quasar/dist/quasar.client.js' },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/composables/useTodoFilter.ts',
        'src/composables/useValidation.ts',
        'src/stores/todoStore.ts',
        'src/utils/validation.ts',
        'src/utils/errorHandling.ts',
        'src/components/TodoItem.vue',
        'src/components/TodoForm.vue',
        'src/components/TodoList.vue',
      ],
    },
  },
});
