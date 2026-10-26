import { readonly, ref } from 'vue';
import { defineStore } from 'pinia';
import { Dark, Notify } from 'quasar';
import { z } from 'zod';
import { useLocalStorage } from '@/composables/useLocalStorage';

export interface Notice {
  id: string;
  message: string;
  type: 'positive' | 'negative' | 'warning';
}

export const useUiStore = defineStore('ui', () => {
  const dark = useLocalStorage('todo.dark', false, z.boolean());
  const drawerOpen = ref(false);
  const notices = ref<Notice[]>([]);

  Dark.set(dark.value);

  function setDark(value: boolean): void {
    dark.value = value;
    Dark.set(value);
  }

  function setDrawer(value: boolean): void {
    drawerOpen.value = value;
  }

  function notify(message: string, type: Notice['type'] = 'positive'): void {
    notices.value = [...notices.value, { id: crypto.randomUUID(), message, type }];
    Notify.create({ message, type, timeout: 1800 });
  }

  return {
    dark: readonly(dark),
    drawerOpen: readonly(drawerOpen),
    notices: readonly(notices),
    setDark,
    setDrawer,
    notify,
  };
});
