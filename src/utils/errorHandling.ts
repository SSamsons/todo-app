import { isAxiosError } from 'axios';
import type { AppErrorKind } from '@/types';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number | undefined;

  constructor(kind: AppErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
  }
}

function readServerMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = data.message;
    if (typeof message === 'string' && message.trim().length > 0) return message;
  }
  return '';
}

/** Разложить любую ошибку по типу, без стека и кода статуса в тексте. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (isAxiosError(err)) {
    if (!err.response) return new AppError('network', 'сеть недоступна');
    const status = err.response.status;
    const serverMessage = readServerMessage(err.response.data);
    if (status === 401 || status === 403) {
      return new AppError('auth', serverMessage || 'нужно войти', status);
    }
    if (status === 400 || status === 409 || status === 422) {
      return new AppError('validation', serverMessage || 'проверь поля', status);
    }
    if (status >= 500) return new AppError('business', 'сервер сломался', status);
    return new AppError('unknown', serverMessage || 'что-то пошло не так', status);
  }

  return new AppError('unknown', 'что-то пошло не так');
}

export function toUserMessage(error: AppError): string {
  if (error.kind === 'network') return 'не получилось достучаться до сервера';
  if (error.kind === 'auth') return 'нужно войти заново';
  if (error.kind === 'validation' || error.kind === 'business') return error.message;
  return 'что-то пошло не так';
}

const log: string[] = [];

export function logError(error: AppError): void {
  log.push(`${error.kind}: ${error.message}`);
  if (log.length > 50) log.shift();
}

export function readErrorLog(): readonly string[] {
  return log;
}
