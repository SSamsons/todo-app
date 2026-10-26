import { z } from 'zod';
import { userSchema } from './todo';

export type AppErrorKind = 'network' | 'validation' | 'business' | 'auth' | 'unknown';

export interface ApiErrorBody {
  message?: string;
}

export const sessionSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

export type Session = z.infer<typeof sessionSchema>;

export const refreshSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

export type RefreshResult = z.infer<typeof refreshSchema>;

export const emailCheckSchema = z.object({
  taken: z.boolean(),
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
