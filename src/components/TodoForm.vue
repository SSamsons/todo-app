<template>
  <form class="q-gutter-sm" @submit.prevent="submit">
    <q-input v-model="title" label="что сделать" outlined dense />
    <form-error :message="error" />
    <q-btn
      type="submit"
      color="primary"
      label="добавить"
      :disable="props.loading"
      :loading="props.loading"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { QBtn, QInput } from 'quasar';
import { useValidation } from '@/composables/useValidation';
import { todoTitleSchema } from '@/utils/validation';
import FormError from './FormError.vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  add: [title: string];
}>();

const title = ref('');
const touched = ref(false);
const { error, validate, reset } = useValidation(todoTitleSchema);

watch(title, (value) => {
  if (!touched.value) return;
  validate(value);
});

function submit(): void {
  touched.value = true;
  if (!validate(title.value)) return;
  emit('add', title.value.trim());
  title.value = '';
  touched.value = false;
  reset();
}
</script>
