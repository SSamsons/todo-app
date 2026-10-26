import { userSchema } from '@/types';
import type { User, UserSettings } from '@/types';
import { AppError } from '@/utils/errorHandling';
import { api } from './apiClient';

export async function updateProfile(userId: string, settings: UserSettings): Promise<User> {
  const response = await api.patch<unknown>(`/users/${userId}`, { name: settings.name });
  const parsed = userSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'сервер не сохранил профиль');
  return parsed.data;
}
