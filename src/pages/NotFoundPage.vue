<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="text-h4">404</div>
        <div class="q-mb-md">нет такой страницы</div>
        <q-btn color="primary" label="на главную" @click="goHome" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { QBtn, QLayout, QPage, QPageContainer, useMeta } from 'quasar';

useMeta({
  title: '404',
  meta: {
    description: { name: 'description', content: 'Страница не найдена' },
    ogTitle: { property: 'og:title', content: '404' },
  },
});

const router = useRouter();

function goHome(): void {
  void router.push('/');
}
</script>
