import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TodoList from '@/components/TodoList.vue';
import type { ITodoItem } from '@/types';

const todos: ITodoItem[] = [
  {
    id: '1',
    title: 'хлеб',
    completed: false,
    createdAt: '2026-10-26T12:00:00.000Z',
    userId: '1',
    tagIds: [],
  },
  {
    id: '2',
    title: 'молоко',
    completed: true,
    createdAt: '2026-10-26T12:00:00.000Z',
    userId: '1',
    tagIds: [],
  },
];

describe('TodoList', () => {
  it('пишет, что пусто', () => {
    const wrapper = mount(TodoList, { props: { todos: [], filter: 'all', search: '' } });
    expect(wrapper.text()).toContain('пока пусто');
  });

  it('фильтрует и ищет', async () => {
    const wrapper = mount(TodoList, { props: { todos, filter: 'all', search: '' } });
    expect(wrapper.text()).toContain('хлеб');
    expect(wrapper.text()).toContain('молоко');

    await wrapper.setProps({ filter: 'active' });
    expect(wrapper.text()).toContain('хлеб');
    expect(wrapper.text()).not.toContain('молоко');

    await wrapper.setProps({ filter: 'all', search: 'zzz' });
    expect(wrapper.text()).toContain('ничего не нашел');
  });
});
