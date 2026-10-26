<template>
  <q-item>
    <q-item-section side>
      <q-checkbox
        :model-value="props.todo.completed"
        @update:model-value="emit('toggle', props.todo.id)"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label :class="props.todo.completed ? 'text-strike text-grey' : ''">
        {{ props.todo.title }}
      </q-item-label>
      <q-item-label caption>{{ created }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn flat color="negative" icon="delete" @click="emit('delete', props.todo.id)" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QBtn, QCheckbox, QItem, QItemLabel, QItemSection } from 'quasar';
import type { ITodoItem } from '@/types';
import { formatDate } from '@/utils/date';

const props = defineProps<{
  todo: ITodoItem;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();

const created = computed(() => formatDate(props.todo.createdAt));
</script>
