import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { AppError, toAppError, toUserMessage } from '@/utils/errorHandling';

describe('errorHandling', () => {
  it('не показывает технический текст сетевой ошибки', () => {
    const error = toAppError(new AxiosError('ECONNREFUSED 10.0.0.1'));
    expect(error.kind).toBe('network');
    expect(toUserMessage(error)).toBe('не получилось достучаться до сервера');
    expect(toUserMessage(error)).not.toContain('ECONNREFUSED');
  });

  it('относит 401 к входу', () => {
    const axiosError = new AxiosError('nope');
    axiosError.response = {
      status: 401,
      data: { message: 'jwt malformed token abc' },
      statusText: 'Unauthorized',
      headers: {},
      config: { headers: {} } as AxiosError['response'] extends infer R
        ? R extends { config: infer C }
          ? C
          : never
        : never,
    };
    const error = toAppError(axiosError);
    expect(error.kind).toBe('auth');
    expect(toUserMessage(error)).toBe('нужно войти заново');
  });

  it('оставляет понятный текст валидации', () => {
    const axiosError = new AxiosError('bad');
    axiosError.response = {
      status: 400,
      data: { message: 'пустое название нельзя' },
      statusText: 'Bad Request',
      headers: {},
      config: { headers: {} } as never,
    };
    const error = toAppError(axiosError);
    expect(toUserMessage(error)).toBe('пустое название нельзя');
  });

  it('не тащит стек неизвестной ошибки', () => {
    const error = toAppError(new Error('Cannot read properties of undefined'));
    expect(toUserMessage(error)).toBe('что-то пошло не так');
  });

  it('пропускает уже готовую ошибку приложения', () => {
    const error = new AppError('business', 'сервер сломался', 500);
    expect(toAppError(error)).toBe(error);
    expect(toUserMessage(error)).toBe('сервер сломался');
  });
});
