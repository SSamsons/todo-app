import { ref, type Ref } from 'vue';
import { toAppError, type AppError } from '@/utils/errorHandling';

export function useAsync<T>(task: () => Promise<T>): {
  loading: Ref<boolean>;
  error: Ref<AppError | null>;
  data: Ref<T | null>;
  run: () => Promise<T | null>;
} {
  const loading = ref(false);
  const error = ref<AppError | null>(null);
  const data = ref<T | null>(null) as Ref<T | null>;

  async function run(): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      const result = await task();
      data.value = result;
      return result;
    } catch (err: unknown) {
      error.value = toAppError(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, data, run };
}
