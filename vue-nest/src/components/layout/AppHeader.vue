<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { findActiveMenuItem } from '@/config/menu'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  sidebarCollapsed: boolean
}>()

const emit = defineEmits<{
  toggleMobileSidebar: []
}>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const userMenuRef = ref<InstanceType<typeof Menu> | null>(null)

const pageTitle = computed(() => findActiveMenuItem(route.path)?.label ?? '工作台')

const initials = computed(() => {
  const name = auth.user?.name?.trim()
  if (!name) return '?'
  return name.slice(0, 1).toUpperCase()
})

const userMenuItems = computed<MenuItem[]>(() => [
  {
    label: auth.user?.email ?? '',
    disabled: true,
    class: 'app-header__menu-email',
  },
  { separator: true },
  {
    label: '退出登录',
    icon: 'pi pi-sign-out',
    command: () => void onLogout(),
  },
])

async function onLogout() {
  await auth.logout()
  await router.push({ name: 'login' })
}

function toggleUserMenu(event: Event) {
  userMenuRef.value?.toggle(event)
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <button
        type="button"
        class="app-header__menu-btn"
        aria-label="打开菜单"
        @click="emit('toggleMobileSidebar')"
      >
        <i class="pi pi-bars" />
      </button>
      <div>
        <p class="app-header__eyebrow">Spring Console</p>
        <h1 class="app-header__title">{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="app-header__right">
      <div class="app-header__status">
        <span class="app-header__status-dot" />
        在线
      </div>

      <button type="button" class="app-header__user" @click="toggleUserMenu">
        <span class="app-header__avatar">{{ initials }}</span>
        <span class="app-header__user-meta">
          <strong>{{ auth.user?.name ?? '用户' }}</strong>
          <span>{{ auth.user?.email ?? '—' }}</span>
        </span>
        <i class="pi pi-chevron-down app-header__chevron" />
      </button>
      <Menu ref="userMenuRef" :model="userMenuItems" popup />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.25rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--spring-border);
  background: rgb(255 255 255 / 0.72);
  backdrop-filter: blur(10px);
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.app-header__menu-btn {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--spring-border);
  border-radius: 0.65rem;
  background: #fff;
  color: var(--spring-muted);
  cursor: pointer;
}

.app-header__menu-btn:hover {
  border-color: var(--spring-mint);
  color: var(--spring-mint-deep);
}

@media (min-width: 1024px) {
  .app-header__menu-btn {
    display: none;
  }
}

.app-header__eyebrow {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--spring-pink-deep);
}

.app-header__title {
  margin: 0.1rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--spring-text);
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.app-header__status {
  display: none;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: var(--spring-mint-soft);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--spring-mint-deep);
}

.app-header__status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--spring-mint);
}

@media (min-width: 768px) {
  .app-header__status {
    display: inline-flex;
  }
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.55rem 0.35rem 0.35rem;
  border: 1px solid var(--spring-border);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.app-header__user:hover {
  border-color: rgb(109 184 154 / 0.45);
  box-shadow: 0 8px 20px rgb(109 184 154 / 0.12);
}

.app-header__avatar {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--spring-pink-soft), var(--spring-mint-soft));
  color: var(--spring-mint-deep);
  font-size: 0.85rem;
  font-weight: 700;
}

.app-header__user-meta {
  display: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.05rem;
  min-width: 0;
  text-align: left;
}

.app-header__user-meta strong {
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  color: var(--spring-text);
}

.app-header__user-meta span {
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
  color: var(--spring-muted);
}

.app-header__chevron {
  display: none;
  font-size: 0.7rem;
  color: var(--spring-muted);
}

@media (min-width: 640px) {
  .app-header__user-meta,
  .app-header__chevron {
    display: flex;
  }
}
</style>

<style>
.app-header__menu-email {
  font-size: 0.78rem !important;
  color: var(--spring-muted) !important;
  opacity: 1 !important;
}
</style>
