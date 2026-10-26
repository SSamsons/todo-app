<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ registerMode ? 'регистрация' : 'войти' }}</div>
    <div class="q-mb-md text-caption">тестовый вход: student@mail.ru / 123456</div>

    <form class="q-gutter-sm" @submit.prevent="submit">
      <q-input v-model="email" type="email" label="почта" outlined dense @blur="touched = true" />
      <form-error :message="emailError" />
      <q-input
        v-model="password"
        type="password"
        label="пароль"
        outlined
        dense
        @blur="touched = true"
      />
      <form-error :message="passwordError" />
      <q-input v-if="registerMode" v-model="name" label="имя" outlined dense />
      <form-error :message="user.error" />
      <q-btn
        type="submit"
        color="primary"
        :label="registerMode ? 'создать' : 'войти'"
        :loading="user.loading"
      />
      <q-btn
        flat
        type="button"
        :label="registerMode ? 'у меня уже есть вход' : 'нет аккаунта'"
        @click="registerMode = !registerMode"
      />
    </form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QBtn, QInput, QPage, useMeta } from 'quasar';
import FormError from '@/components/FormError.vue';
import { isEmailTaken } from '@/services/authService';
import { useUserStore } from '@/stores/userStore';
import { logError, toAppError } from '@/utils/errorHandling';
import { validateEmail, validatePassword } from '@/utils/validation';

useMeta({
  title: 'Вход',
  meta: {
    description: { name: 'description', content: 'Вход в список дел' },
    ogTitle: { property: 'og:title', content: 'Вход' },
  },
});

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const email = ref('');
const password = ref('');
const name = ref('');
const registerMode = ref(false);
const touched = ref(false);
const emailError = ref('');
const passwordError = ref('');

watch([email, password, touched], () => {
  if (!touched.value) return;
  emailError.value = validateEmail(email.value);
  passwordError.value = validatePassword(password.value);
});

watch(email, (value) => {
  window.setTimeout(() => {
    void checkUnique(value);
  }, 400);
});

async function checkUnique(value: string): Promise<void> {
  if (!registerMode.value || validateEmail(value)) return;
  try {
    const taken = await isEmailTaken(value.trim());
    if (taken) emailError.value = 'такая почта уже есть';
  } catch (err: unknown) {
    logError(toAppError(err));
  }
}

async function submit(): Promise<void> {
  touched.value = true;
  emailError.value = validateEmail(email.value);
  passwordError.value = validatePassword(password.value);
  if (emailError.value || passwordError.value) return;

  const ok = registerMode.value
    ? await user.register({ email: email.value, password: password.value, name: name.value })
    : await user.login(email.value, password.value);

  if (!ok) return;
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  await router.push(redirect);
}
</script>
