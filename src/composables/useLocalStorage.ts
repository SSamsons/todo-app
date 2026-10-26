import { ref, watch, type Ref } from 'vue';
import type { z, ZodTypeDef } from 'zod';

function readStored<T>(key: string, initial: T, schema?: z.ZodType<T, ZodTypeDef, unknown>): T {
  if (typeof localStorage === 'undefined') return initial;
  const raw = localStorage.getItem(key);
  if (raw === null) return initial;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!schema) return initial;
    const result = schema.safeParse(parsed);
    return result.success ? result.data : initial;
  } catch {
    return initial;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  schema: z.ZodType<T, ZodTypeDef, unknown>,
): Ref<T> {
  const value = ref(readStored(key, initial, schema)) as Ref<T>;

  watch(
    value,
    (next) => {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(next));
    },
    { deep: true },
  );

  return value;
}
