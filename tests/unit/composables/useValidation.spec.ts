import { describe, expect, it } from 'vitest';
import { useValidation } from '@/composables/useValidation';
import { emailSchema, passwordSchema } from '@/utils/validation';

describe('useValidation', () => {
  it('принимает нормальную почту', () => {
    const { error, validate } = useValidation(emailSchema);
    expect(validate('student@mail.ru')).toBe(true);
    expect(error.value).toBe('');
  });

  it('ругается на пароль', () => {
    const { error, validate } = useValidation(passwordSchema);
    expect(validate('123')).toBe(false);
    expect(error.value).toBe('пароль короче 6 символов');
  });

  it('сбрасывает текст ошибки', () => {
    const { error, validate, reset } = useValidation(emailSchema);
    validate('не почта');
    reset();
    expect(error.value).toBe('');
  });
});
