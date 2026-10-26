import type { ZodError } from 'zod';

export function messageFromZod(error: ZodError): string {
  return error.issues[0]?.message ?? 'проверь поля';
}

export function hasText(value: string): boolean {
  return value.trim().length > 0;
}
