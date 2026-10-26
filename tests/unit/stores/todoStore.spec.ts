import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { useTodoStore } from '@/stores/todoStore';
import { useUserStore } from '@/stores/userStore';
import * as todoService from '@/services/todoService';
import type { ITodoItem } from '@/types';

vi.mock('@/services/todoService', () => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  removeTodo: vi.fn(),
  clearTodoCache: vi.fn(),
}));

function task(id: string, title: string, completed = false): ITodoItem {
  return {
    id,
    title,
    completed,
    createdAt: '2026-10-26T12:00:00.000Z',
    userId: '1',
    tagIds: [],
  };
}

describe('todoStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('добавляет задачу локально и прячет пустой ввод', async () => {
    const store = useTodoStore();
    await store.addTodo('   ');
    expect(store.todos).toHaveLength(0);
    expect(store.error).toBe('напиши хотя бы слово');

    await store.addTodo('купить хлеб');
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]?.title).toBe('купить хлеб');
    expect(localStorage.getItem('todo.items')).toContain('купить хлеб');
  });

  it('фильтрует, ищет, отмечает и удаляет', async () => {
    const store = useTodoStore();
    await store.addTodo('хлеб');
    await store.addTodo('молоко');
    const first = store.todos[1];
    expect(first).toBeDefined();
    if (!first) return;

    await store.toggleTodo(first.id);
    store.setFilter('done');
    expect(store.filteredTodos.map((todo) => todo.title)).toEqual(['хлеб']);

    store.setFilter('all');
    store.setSearch('мол');
    expect(store.filteredTodos).toHaveLength(1);
    expect(store.filteredTodos[0]?.title).toBe('молоко');

    await store.deleteTodo(store.filteredTodos[0]?.id ?? '');
    expect(store.todos.map((todo) => todo.title)).toEqual(['хлеб']);
  });

  it('показывает понятную ошибку, если сервер недоступен', async () => {
    vi.mocked(todoService.listTodos).mockRejectedValue(new AxiosError('ECONNREFUSED'));
    const user = useUserStore();
    user.saveSession({
      token: 'token',
      refreshToken: 'token',
      user: { id: '1', email: 'student@mail.ru', name: 'Студент' },
    });
    const store = useTodoStore();
    await store.loadTodos();
    expect(store.error).toBe('не получилось достучаться до сервера');
  });

  it('без входа загрузка не ходит на сервер', async () => {
    const store = useTodoStore();
    await store.loadTodos();
    expect(todoService.listTodos).not.toHaveBeenCalled();
  });

  it('с входом отмечает и удаляет через сервер', async () => {
    vi.mocked(todoService.createTodo).mockResolvedValue(task('1', 'хлеб'));
    vi.mocked(todoService.updateTodo).mockResolvedValue(task('1', 'хлеб', true));
    vi.mocked(todoService.removeTodo).mockResolvedValue();
    const user = useUserStore();
    user.saveSession({
      token: 'token',
      refreshToken: 'token',
      user: { id: '1', email: 'student@mail.ru', name: 'Студент' },
    });
    const store = useTodoStore();
    await store.addTodo('хлеб');
    const id = store.todos[0]?.id ?? '';
    await store.toggleTodo(id);
    expect(todoService.updateTodo).toHaveBeenCalled();
    await store.deleteTodo(id);
    expect(todoService.removeTodo).toHaveBeenCalledWith(id);
    expect(store.todos).toHaveLength(0);
  });

  it('кладёт задачу с сервера, когда есть вход', async () => {
    const created = task('9', 'с сервера');
    vi.mocked(todoService.createTodo).mockResolvedValue(created);
    const user = useUserStore();
    user.saveSession({
      token: 'token',
      refreshToken: 'token',
      user: { id: '1', email: 'student@mail.ru', name: 'Студент' },
    });
    const store = useTodoStore();
    await store.addTodo('с сервера');
    expect(todoService.createTodo).toHaveBeenCalledOnce();
    expect(store.todos[0]?.id).toBe('9');
  });
});
