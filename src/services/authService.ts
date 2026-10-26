import { emailCheckSchema, refreshSchema, sessionSchema } from '@/types';
import type { RefreshResult, RegisterRequest, Session } from '@/types';
import { AppError } from '@/utils/errorHandling';
import { api } from './apiClient';
import { clearTokens, readRefreshToken, saveTokens } from './tokenStorage';

export async function loginRequest(email: string, password: string): Promise<Session> {
  const response = await api.post<unknown>('/login', { email, password });
  const parsed = sessionSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'сервер прислал странный ответ');
  saveTokens(parsed.data.token, parsed.data.refreshToken);
  return parsed.data;
}

export async function registerRequest(payload: RegisterRequest): Promise<Session> {
  const response = await api.post<unknown>('/register', payload);
  const parsed = sessionSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'сервер прислал странный ответ');
  saveTokens(parsed.data.token, parsed.data.refreshToken);
  return parsed.data;
}

export async function refreshSession(): Promise<RefreshResult | null> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await api.post<unknown>('/refresh', { refreshToken });
    const parsed = refreshSchema.safeParse(response.data);
    if (!parsed.success) {
      clearTokens();
      return null;
    }
    saveTokens(parsed.data.token, parsed.data.refreshToken);
    return parsed.data;
  } catch {
    clearTokens();
    return null;
  }
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const response = await api.get<unknown>('/check-email', { params: { email } });
  const parsed = emailCheckSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'не вышло проверить почту');
  return parsed.data.taken;
}
