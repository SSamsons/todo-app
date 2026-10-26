import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TodoItem from '@/components/TodoItem.vue';
import type { ITodoItem } from '@/types';

const todo: ITodoItem = {
  id: '1',
  title: 'купить хлеб',
  completed: false,
  createdAt: '2026-10-26T12:00:00.000Z',
  userId: '1',
  tagIds: [],
};

describe('TodoItem', () => {
  it('показывает название и дату', () => {
    const wrapper = mount(TodoItem, { props: { todo } });
    expect(wrapper.text()).toContain('купить хлеб');
    expect(wrapper.text()).toContain('26/10/2026');
  });

  it('зачёркивает выполненную', () => {
    const wrapper = mount(TodoItem, { props: { todo: { ...todo, completed: true } } });
    expect(wrapper.find('.text-strike').exists()).toBe(true);
  });

  it('шлёт toggle и delete', async () => {
    const wrapper = mount(TodoItem, { props: { todo } });
    await wrapper.get('.q-checkbox').trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['1']);
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1']);
  });
});
