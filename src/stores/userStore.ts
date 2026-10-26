import { computed, readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import { z } from 'zod';
import { settingsSchema, userSchema } from '@/types';
import type { RegisterRequest, Session, UserSettings } from '@/types';
import { useLocalStorage } from '@/composables/useLocalStorage';
import { loginRequest, registerRequest } from '@/services/authService';
import { updateProfile } from '@/services/userService';
import { clearTokens, onTokensCleared, readToken } from '@/services/tokenStorage';
import { toAppError, toUserMessage } from '@/utils/errorHandling';
import { emailSchema, passwordSchema } from '@/utils/validation';

export const useUserStore = defineStore('user', () => {
  const user = useLocalStorage('todo.user', null, userSchema.nullable());
  const settings = useLocalStorage(
    'todo.settings',
    { name: user.value?.name ?? '', dark: false },
    settingsSchema,
  );
  const token = ref(readToken());
  const offline = useLocalStorage('todo.offline', false, z.boolean());
  const loading = ref(false);
  const error = ref('');

  onTokensCleared(() => {
    token.value = '';
    user.value = null;
    offline.value = false;
  });

  const isAuthenticated = computed(() => token.value.length > 0 && user.value !== null);

  function saveSession(session: Session): void {
    token.value = session.token;
    user.value = session.user;
    settings.value = { ...settings.value, name: session.user.name };
  }

  async function login(email: string, password: string): Promise<boolean> {
    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) {
      error.value = emailCheck.error.issues[0]?.message ?? 'проверь почту';
      return false;
    }
    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      error.value = passwordCheck.error.issues[0]?.message ?? 'проверь пароль';
      return false;
    }

    loading.value = true;
    error.value = '';
    try {
      const session = await loginRequest(emailCheck.data, passwordCheck.data);
      offline.value = false;
      saveSession(session);
      return true;
    } catch (err: unknown) {
      const appError = toAppError(err);
      const demoLogin = emailCheck.data === 'student@mail.ru' && passwordCheck.data === '123456';
      if (demoLogin && appError.kind !== 'auth') {
        offline.value = true;
        saveSession({
          token: 'local-demo',
          refreshToken: 'local-demo',
          user: { id: 'local', email: emailCheck.data, name: 'Студент' },
        });
        return true;
      }
      error.value = toUserMessage(appError);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: RegisterRequest): Promise<boolean> {
    const emailCheck = emailSchema.safeParse(payload.email);
    if (!emailCheck.success) {
      error.value = emailCheck.error.issues[0]?.message ?? 'проверь почту';
      return false;
    }
    const passwordCheck = passwordSchema.safeParse(payload.password);
    if (!passwordCheck.success) {
      error.value = passwordCheck.error.issues[0]?.message ?? 'проверь пароль';
      return false;
    }

    loading.value = true;
    error.value = '';
    try {
      const session = await registerRequest({
        email: emailCheck.data,
        password: passwordCheck.data,
        name: payload.name.trim() || 'студент',
      });
      saveSession(session);
      return true;
    } catch (err: unknown) {
      error.value = toUserMessage(toAppError(err));
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    clearTokens();
  }

  async function saveSettings(next: UserSettings): Promise<void> {
    settings.value = next;
    if (!user.value || offline.value) {
      if (user.value) user.value = { ...user.value, name: next.name };
      return;
    }
    try {
      user.value = await updateProfile(user.value.id, next);
      error.value = '';
    } catch (err: unknown) {
      error.value = toUserMessage(toAppError(err));
    }
  }

  return {
    user: readonly(user),
    settings: readonly(settings),
    isAuthenticated,
    offline: readonly(offline),
    loading: readonly(loading),
    error: readonly(error),
    login,
    register,
    logout,
    saveSession,
    saveSettings,
  };
});
