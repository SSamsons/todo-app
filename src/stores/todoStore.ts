import { computed, readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import { todoListSchema } from '@/types';
import type { ITodoItem, TodoFilter } from '@/types';
import { useApi } from '@/composables/useApi';
import { useAsync } from '@/composables/useAsync';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { useLocalStorage } from '@/composables/useLocalStorage';
import { useTodoFilter } from '@/composables/useTodoFilter';
import { createTodo, listTodos, removeTodo, updateTodo } from '@/services/todoService';
import { AppError } from '@/utils/errorHandling';
import { validateTodoTitle } from '@/utils/validation';
import { useUiStore } from './uiStore';
import { useUserStore } from './userStore';

export const useTodoStore = defineStore('todo', () => {
  const userStore = useUserStore();
  const uiStore = useUiStore();
  const errors = useErrorHandler();
  const apiHelper = useApi();
  const todos = useLocalStorage<ITodoItem[]>('todo.items', [], todoListSchema);
  const filter = ref<TodoFilter>('all');
  const search = ref('');
  const { filtered } = useTodoFilter(todos, filter, search);

  function keepsTasksLocally(): boolean {
    return !userStore.isAuthenticated || userStore.offline;
  }

  const loader = useAsync(async () => {
    if (keepsTasksLocally() || userStore.user === null) {
      if (userStore.offline && todos.value.length === 0) {
        todos.value = [
          {
            id: 'demo-1',
            title: 'открыть практику',
            completed: false,
            createdAt: '2026-10-20T09:00:00.000Z',
            userId: 'local',
            tagIds: [],
          },
          {
            id: 'demo-2',
            title: 'сдать список дел',
            completed: true,
            createdAt: '2026-10-21T12:30:00.000Z',
            userId: 'local',
            tagIds: [],
          },
        ];
      }
      return [...todos.value];
    }
    const items = await listTodos(userStore.user.id);
    todos.value = items;
    return items;
  });

  const loading = computed(() => loader.loading.value || apiHelper.loading.value);

  function setFilter(value: TodoFilter): void {
    filter.value = value;
  }

  function setSearch(value: string): void {
    search.value = value;
  }

  async function loadTodos(): Promise<void> {
    await loader.run();
    if (loader.error.value) {
      errors.handle(loader.error.value, () => {
        void loadTodos();
      });
    } else {
      errors.clear();
    }
  }

  async function addTodo(title: string): Promise<void> {
    const problem = validateTodoTitle(title);
    if (problem) {
      errors.handle(new AppError('validation', problem));
      return;
    }

    const clean = title.trim();
    if (keepsTasksLocally() || userStore.user === null) {
      const item: ITodoItem = {
        id: crypto.randomUUID(),
        title: clean,
        completed: false,
        createdAt: new Date().toISOString(),
        userId: 'local',
        tagIds: [],
      };
      todos.value = [item, ...todos.value];
      errors.clear();
      uiStore.notify('добавил');
      return;
    }

    try {
      const created = await apiHelper.run(() =>
        createTodo({
          title: clean,
          completed: false,
          createdAt: new Date().toISOString(),
          userId: userStore.user?.id ?? 'local',
          tagIds: [],
        }),
      );
      todos.value = [created, ...todos.value.filter((todo) => todo.id !== created.id)];
      errors.clear();
      uiStore.notify('добавил');
    } catch (err: unknown) {
      errors.handle(err, () => {
        void addTodo(title);
      });
    }
  }

  async function toggleTodo(id: string): Promise<void> {
    const current = todos.value.find((todo) => todo.id === id);
    if (!current) return;
    const completed = !current.completed;

    if (keepsTasksLocally()) {
      todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, completed } : todo));
      return;
    }

    try {
      const updated = await apiHelper.run(() => updateTodo(id, { completed }));
      todos.value = todos.value.map((todo) => (todo.id === id ? updated : todo));
    } catch (err: unknown) {
      errors.handle(err, () => {
        void toggleTodo(id);
      });
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    if (keepsTasksLocally()) {
      todos.value = todos.value.filter((todo) => todo.id !== id);
      return;
    }

    try {
      await apiHelper.run(() => removeTodo(id));
      todos.value = todos.value.filter((todo) => todo.id !== id);
    } catch (err: unknown) {
      errors.handle(err, () => {
        void deleteTodo(id);
      });
    }
  }

  return {
    todos: readonly(todos),
    filteredTodos: filtered,
    filter: readonly(filter),
    search: readonly(search),
    loading,
    error: computed(() => errors.message.value),
    setFilter,
    setSearch,
    loadTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
});
