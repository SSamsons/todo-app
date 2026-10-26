import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { ITodoItem, TodoFilter } from '@/types';

/** Фильтр и поиск по уже загруженному списку. Состояние можно передать снаружи. */
export function useTodoFilter(
  todos: Ref<readonly ITodoItem[]>,
  filter: Ref<TodoFilter> = ref('all'),
  search: Ref<string> = ref(''),
): {
  filter: Ref<TodoFilter>;
  search: Ref<string>;
  filtered: ComputedRef<ITodoItem[]>;
} {
  const filtered = computed(() => {
    const query = search.value.trim().toLowerCase();
    return todos.value.filter((todo) => {
      if (filter.value === 'active' && todo.completed) return false;
      if (filter.value === 'done' && !todo.completed) return false;
      if (query.length > 0 && !todo.title.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  return { filter, search, filtered };
}
