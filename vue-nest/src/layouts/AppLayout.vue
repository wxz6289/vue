<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useSidebar } from '@/composables/useSidebar'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const { collapsed } = useSidebar()
const mobileOpen = ref(false)
const bootError = ref('')

onMounted(async () => {
  try {
    await auth.refreshProfile()
  } catch (e) {
    bootError.value = e instanceof Error ? e.message : '获取用户信息失败'
    auth.clearSession()
    await router.replace({ name: 'login' })
  }
})

function toggleMobileSidebar() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobileSidebar() {
  mobileOpen.value = false
}
</script>

<template>
  <div
    class="app-shell"
    :class="{
      'app-shell--collapsed': collapsed,
    }"
  >
    <div
      v-if="mobileOpen"
      class="app-shell__backdrop"
      aria-hidden="true"
      @click="closeMobileSidebar"
    />

    <AppSidebar :mobile-open="mobileOpen" @close-mobile="closeMobileSidebar" />

    <div class="app-shell__main">
      <AppHeader
        :sidebar-collapsed="collapsed"
        @toggle-mobile-sidebar="toggleMobileSidebar"
      />

      <main class="app-shell__content">
        <p v-if="bootError" class="app-shell__error">{{ bootError }}</p>
        <RouterView v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  --sidebar-width: 15.5rem;
  --sidebar-collapsed: 4.25rem;

  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgb(255 211 224 / 0.35), transparent 28%),
    radial-gradient(circle at 88% 0%, rgb(168 230 207 / 0.28), transparent 24%),
    linear-gradient(180deg, #f8fcf9 0%, #f3faf6 48%, #faf8f4 100%);
  color: var(--spring-text);
}

.app-shell__main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.24s ease;
}

.app-shell--collapsed .app-shell__main {
  margin-left: var(--sidebar-collapsed);
}

.app-shell__content {
  padding: 1.25rem;
}

.app-shell__error {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.875rem;
}

.app-shell__backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgb(42 64 54 / 0.28);
  backdrop-filter: blur(2px);
}

@media (max-width: 1023px) {
  .app-shell__main,
  .app-shell--collapsed .app-shell__main {
    margin-left: 0;
  }
}

@media (min-width: 768px) {
  .app-shell__content {
    padding: 1.5rem 1.75rem 2rem;
  }
}
</style>
