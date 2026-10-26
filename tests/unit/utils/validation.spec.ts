import { describe, expect, it } from 'vitest';
import { validateEmail, validatePassword, validateTodoTitle } from '@/utils/validation';

describe('validation', () => {
  it('не пускает пустую задачу', () => {
    expect(validateTodoTitle('   ')).toBe('напиши хотя бы слово');
  });

  it('принимает короткое название', () => {
    expect(validateTodoTitle(' хлеб ')).toBe('');
  });

  it('проверяет почту', () => {
    expect(validateEmail('student@mail.ru')).toBe('');
    expect(validateEmail('abc')).toBe('это не похоже на почту');
  });

  it('проверяет пароль', () => {
    expect(validatePassword('123456')).toBe('');
    expect(validatePassword('123')).toBe('пароль короче 6 символов');
  });
});
