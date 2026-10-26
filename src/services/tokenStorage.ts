const TOKEN_KEY = 'todo.token';
const REFRESH_KEY = 'todo.refresh';

const clearListeners = new Set<() => void>();

function storage(): Storage | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function readToken(): string {
  return storage()?.getItem(TOKEN_KEY) ?? '';
}

export function readRefreshToken(): string {
  return storage()?.getItem(REFRESH_KEY) ?? '';
}

export function saveTokens(token: string, refreshToken: string): void {
  storage()?.setItem(TOKEN_KEY, token);
  storage()?.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  storage()?.removeItem(TOKEN_KEY);
  storage()?.removeItem(REFRESH_KEY);
  clearListeners.forEach((listener) => listener());
}

export function onTokensCleared(listener: () => void): void {
  clearListeners.add(listener);
}
