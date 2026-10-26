import { ref, type Ref } from 'vue';
import type { z } from 'zod';
import { messageFromZod } from '@/utils/formHelpers';

export function useValidation<T>(schema: z.ZodType<T>): {
  error: Ref<string>;
  validate: (value: unknown) => boolean;
  reset: () => void;
} {
  const error = ref('');

  function validate(value: unknown): boolean {
    const parsed = schema.safeParse(value);
    if (parsed.success) {
      error.value = '';
      return true;
    }
    error.value = messageFromZod(parsed.error);
    return false;
  }

  function reset(): void {
    error.value = '';
  }

  return { error, validate, reset };
}
