import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TodoForm from '@/components/TodoForm.vue';

describe('TodoForm', () => {
  it('не добавляет пустую задачу', async () => {
    const wrapper = mount(TodoForm);
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')).toBeUndefined();
    expect(wrapper.text()).toContain('напиши хотя бы слово');
  });

  it('отправляет название и очищает поле', async () => {
    const wrapper = mount(TodoForm);
    await wrapper.get('input').setValue('купить хлеб');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')?.[0]).toEqual(['купить хлеб']);
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('');
  });
});
