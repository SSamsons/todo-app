<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="меню" @click="toggleDrawer" />
        <q-toolbar-title>туду</q-toolbar-title>
        <q-breadcrumbs class="text-white" active-color="white">
          <q-breadcrumbs-el label="домой" @click="goHome" />
          <q-breadcrumbs-el v-if="crumb" :label="crumb" />
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <q-drawer :model-value="ui.drawerOpen" show-if-above bordered @update:model-value="ui.setDrawer">
      <q-list>
        <q-item-label header>меню</q-item-label>
        <q-item clickable @click="goHome">
          <q-item-section>задачи</q-item-section>
        </q-item>
        <q-item clickable @click="goSettings">
          <q-item-section>настройки</q-item-section>
        </q-item>
        <q-item clickable @click="onLogout">
          <q-item-section>выйти</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  QBreadcrumbs,
  QBreadcrumbsEl,
  QBtn,
  QDrawer,
  QHeader,
  QItem,
  QItemLabel,
  QItemSection,
  QLayout,
  QList,
  QPageContainer,
  QToolbar,
  QToolbarTitle,
} from 'quasar';
import { useUiStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const user = useUserStore();

const crumb = computed(() =>
  typeof route.meta.breadcrumb === 'string' ? route.meta.breadcrumb : '',
);

function toggleDrawer(): void {
  ui.setDrawer(!ui.drawerOpen);
}

function goHome(): void {
  void router.push('/');
}

function goSettings(): void {
  void router.push('/settings');
}

function onLogout(): void {
  user.logout();
  void router.push('/login');
}
</script>
