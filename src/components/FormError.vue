<template>
  <div v-if="props.message" class="text-negative q-mt-xs">
    {{ props.message }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ message: string }>();
</script>
