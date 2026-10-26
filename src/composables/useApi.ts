import { ref, type Ref } from 'vue';
import { clearTodoCache } from '@/services/todoService';

export function useApi(): {
  loading: Ref<boolean>;
  run: <T>(action: () => Promise<T>) => Promise<T>;
  clearCache: () => void;
} {
  const loading = ref(false);

  async function run<T>(action: () => Promise<T>): Promise<T> {
    loading.value = true;
    try {
      return await action();
    } finally {
      loading.value = false;
    }
  }

  return { loading, run, clearCache: clearTodoCache };
}
