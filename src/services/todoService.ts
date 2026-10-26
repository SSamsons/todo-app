import { todoListSchema, todoSchema } from '@/types';
import type { CreateTodoPayload, ITodoItem, UpdateTodoPayload } from '@/types';
import axios from 'axios';
import { AppError, toAppError } from '@/utils/errorHandling';
import { todoTitleSchema } from '@/utils/validation';
import { api } from './apiClient';

let listController: AbortController | null = null;
let listCache: { key: string; at: number; data: ITodoItem[] } | null = null;
const CACHE_MS = 5000;

export function clearTodoCache(): void {
  listCache = null;
}

export async function listTodos(userId: string, force = false): Promise<ITodoItem[]> {
  const key = userId;
  if (!force && listCache && listCache.key === key && Date.now() - listCache.at < CACHE_MS) {
    return listCache.data;
  }

  listController?.abort();
  listController = new AbortController();

  try {
    const response = await api.get<unknown>('/todos', {
      params: { userId },
      signal: listController.signal,
    });
    const parsed = todoListSchema.safeParse(response.data);
    if (!parsed.success) throw new AppError('validation', 'сервер прислал странные задачи');
    listCache = { key, at: Date.now(), data: parsed.data };
    return parsed.data;
  } catch (err: unknown) {
    if (axios.isCancel(err)) throw new AppError('network', 'запрос отменён');
    throw toAppError(err);
  }
}

export async function createTodo(payload: CreateTodoPayload): Promise<ITodoItem> {
  const title = todoTitleSchema.safeParse(payload.title);
  if (!title.success) {
    throw new AppError('validation', title.error.issues[0]?.message ?? 'проверь название');
  }
  const response = await api.post<unknown>('/todos', { ...payload, title: title.data });
  const parsed = todoSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'сервер не сохранил задачу');
  clearTodoCache();
  return parsed.data;
}

export async function updateTodo(id: string, payload: UpdateTodoPayload): Promise<ITodoItem> {
  const response = await api.patch<unknown>(`/todos/${id}`, payload);
  const parsed = todoSchema.safeParse(response.data);
  if (!parsed.success) throw new AppError('validation', 'сервер не обновил задачу');
  clearTodoCache();
  return parsed.data;
}

export async function removeTodo(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
  clearTodoCache();
}
