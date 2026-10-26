<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">настройки</div>
    <q-toggle :model-value="ui.dark" label="темная тема" @update:model-value="ui.setDark" />
    <q-input v-model="name" class="q-mt-md" label="как тебя звать" outlined dense />
    <form-error :message="user.error" />
    <q-btn class="q-mt-md" color="primary" label="сохранить" @click="save" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QBtn, QInput, QPage, QToggle, useMeta } from 'quasar';
import FormError from '@/components/FormError.vue';
import { useUiStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';

useMeta({
  title: 'Настройки',
  meta: {
    description: { name: 'description', content: 'Настройки списка дел' },
    ogTitle: { property: 'og:title', content: 'Настройки' },
    ogDescription: { property: 'og:description', content: 'Настройки списка дел' },
  },
});

const ui = useUiStore();
const user = useUserStore();
const name = ref(user.settings.name);

function save(): void {
  void user.saveSettings({ name: name.value, dark: ui.dark });
  ui.notify('сохранил');
}
</script>
