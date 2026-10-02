<script setup lang="ts">
defineProps<{
  subtitle?: string
}>()
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>
