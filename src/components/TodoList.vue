<template>
  <div>
    <q-item v-if="filtered.length === 0">
      <q-item-section>{{ emptyText }}</q-item-section>
    </q-item>
    <q-list v-else bordered separator>
      <transition-group enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <todo-item
          v-for="todo in filtered"
          :key="todo.id"
          :todo="todo"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
        />
      </transition-group>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import { QItem, QItemSection, QList } from 'quasar';
import type { ITodoItem, TodoFilter } from '@/types';
import { useTodoFilter } from '@/composables/useTodoFilter';
import TodoItem from './TodoItem.vue';

const props = defineProps<{
  todos: readonly ITodoItem[];
  filter: TodoFilter;
  search: string;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();

const todos = toRef(props, 'todos');
const filter = ref<TodoFilter>(props.filter);
const search = ref(props.search);

watch(
  () => props.filter,
  (value) => {
    filter.value = value;
  },
);

watch(
  () => props.search,
  (value) => {
    search.value = value;
  },
);

const { filtered } = useTodoFilter(todos, filter, search);

const emptyText = computed(() =>
  props.search.trim().length > 0 ? 'ничего не нашел' : 'пока пусто',
);
</script>
