<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">список дел</div>

    <q-btn-toggle
      class="q-mb-md"
      :model-value="store.filter"
      toggle-color="primary"
      :options="filterOptions"
      @update:model-value="onFilter"
    />

    <q-input
      class="q-mb-md"
      :model-value="store.search"
      label="поиск"
      outlined
      dense
      @update:model-value="onSearch"
    />

    <todo-form :loading="store.loading" @add="onAdd" />

    <q-slide-transition>
      <div v-show="store.error">
        <q-banner class="bg-red-2 q-mt-md">{{ store.error }}</q-banner>
      </div>
    </q-slide-transition>

    <q-spinner v-if="store.loading" class="q-mt-md" color="primary" size="32px" />

    <todo-list
      class="q-mt-md"
      :todos="store.todos"
      :filter="store.filter"
      :search="store.search"
      @toggle="onToggle"
      @delete="onDelete"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { QBanner, QBtnToggle, QInput, QPage, QSlideTransition, QSpinner, useMeta } from 'quasar';
import type { TodoFilter } from '@/types';
import TodoForm from '@/components/TodoForm.vue';
import TodoList from '@/components/TodoList.vue';
import { useTodoStore } from '@/stores/todoStore';

useMeta({
  title: 'Задачи',
  meta: {
    description: { name: 'description', content: 'Список дел для практики' },
    ogTitle: { property: 'og:title', content: 'Задачи' },
    ogDescription: { property: 'og:description', content: 'Список дел для практики' },
  },
});

const store = useTodoStore();

const filterOptions: { label: string; value: TodoFilter }[] = [
  { label: 'все', value: 'all' },
  { label: 'активные', value: 'active' },
  { label: 'готово', value: 'done' },
];

function onFilter(value: string | number | null): void {
  if (value === 'all' || value === 'active' || value === 'done') store.setFilter(value);
}

function onSearch(value: string | number | null): void {
  store.setSearch(typeof value === 'string' ? value : '');
}

function onAdd(title: string): void {
  void store.addTodo(title);
}

function onToggle(id: string): void {
  void store.toggleTodo(id);
}

function onDelete(id: string): void {
  void store.deleteTodo(id);
}

onMounted(() => {
  void store.loadTodos();
});
</script>
