import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { useTodoFilter } from '@/composables/useTodoFilter';
import type { ITodoItem } from '@/types';

function item(id: string, title: string, completed: boolean): ITodoItem {
  return {
    id,
    title,
    completed,
    createdAt: '2026-10-26T12:00:00.000Z',
    userId: '1',
    tagIds: [],
  };
}

describe('useTodoFilter', () => {
  const todos = ref<ITodoItem[]>([item('1', 'Купить хлеб', false), item('2', 'Сдать практику', true)]);

  it('показывает все', () => {
    const { filtered } = useTodoFilter(todos);
    expect(filtered.value).toHaveLength(2);
  });

  it('оставляет только активные', () => {
    const filter = ref<'all' | 'active' | 'done'>('active');
    const { filtered } = useTodoFilter(todos, filter);
    expect(filtered.value.map((todo) => todo.id)).toEqual(['1']);
  });

  it('оставляет только выполненные', () => {
    const filter = ref<'all' | 'active' | 'done'>('done');
    const { filtered } = useTodoFilter(todos, filter);
    expect(filtered.value.map((todo) => todo.id)).toEqual(['2']);
  });

  it('ищет по названию', () => {
    const search = ref('хлеб');
    const { filtered } = useTodoFilter(todos, ref('all'), search);
    expect(filtered.value).toHaveLength(1);
    expect(filtered.value[0]?.title).toBe('Купить хлеб');
  });
});
