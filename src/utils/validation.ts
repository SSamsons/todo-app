import { z } from 'zod';

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, 'напиши хотя бы слово')
  .max(120, 'слишком длинно, укороти');

export const emailSchema = z.string().trim().email('это не похоже на почту');

export const passwordSchema = z.string().min(6, 'пароль короче 6 символов');

export function validateTodoTitle(title: string): string {
  const parsed = todoTitleSchema.safeParse(title);
  return parsed.success ? '' : (parsed.error.issues[0]?.message ?? 'проверь название');
}

export function validateEmail(email: string): string {
  const parsed = emailSchema.safeParse(email);
  return parsed.success ? '' : (parsed.error.issues[0]?.message ?? 'проверь почту');
}

export function validatePassword(password: string): string {
  const parsed = passwordSchema.safeParse(password);
  return parsed.success ? '' : (parsed.error.issues[0]?.message ?? 'проверь пароль');
}
