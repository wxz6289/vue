<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMenuGroups, type MenuItem } from '@/config/menu'
import { useSidebar } from '@/composables/useSidebar'

defineProps<{
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  closeMobile: []
}>()

const route = useRoute()
const { collapsed, toggle } = useSidebar()
const menuGroups = computed(() => getMenuGroups())

function isActive(item: MenuItem) {
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function onNavigate() {
  emit('closeMobile')
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{
      'app-sidebar--collapsed': collapsed,
      'app-sidebar--mobile-open': mobileOpen,
    }"
  >
    <div class="app-sidebar__brand">
      <span class="app-sidebar__logo" aria-hidden="true">
        <i class="pi pi-sparkles" />
      </span>
      <Transition name="sidebar-label">
        <div v-if="!collapsed" class="app-sidebar__brand-text">
          <strong>Vue Nest</strong>
          <span>控制台</span>
        </div>
      </Transition>
    </div>

    <nav class="app-sidebar__nav">
      <section v-for="group in menuGroups" :key="group.key" class="app-sidebar__group">
        <Transition name="sidebar-label">
          <p v-if="!collapsed" class="app-sidebar__group-label">{{ group.label }}</p>
        </Transition>
        <ul class="app-sidebar__list">
          <li v-for="item in group.items" :key="item.key">
            <RouterLink
              :to="item.to"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive(item) }"
              :title="collapsed ? item.label : undefined"
              @click="onNavigate"
            >
              <i :class="item.icon" class="app-sidebar__icon" />
              <Transition name="sidebar-label">
                <span v-if="!collapsed" class="app-sidebar__label">{{ item.label }}</span>
              </Transition>
            </RouterLink>
          </li>
        </ul>
      </section>
    </nav>

    <button
      type="button"
      class="app-sidebar__toggle"
      :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
      @click="toggle"
    >
      <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" />
    </button>
  </aside>
</template>

<style scoped>
.app-sidebar {
  --sidebar-width: 15.5rem;
  --sidebar-collapsed: 4.25rem;

  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  width: var(--sidebar-width);
  flex-direction: column;
  border-right: 1px solid var(--spring-border);
  background: rgb(255 255 255 / 0.82);
  backdrop-filter: blur(12px);
  transition: width 0.24s ease, transform 0.24s ease;
}

.app-sidebar--collapsed {
  width: var(--sidebar-collapsed);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem 1rem;
  border-bottom: 1px solid var(--spring-border);
}

.app-sidebar__logo {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 0.85rem;
  background: linear-gradient(145deg, var(--spring-mint), var(--spring-sky));
  color: #fff;
  font-size: 1rem;
}

.app-sidebar__brand-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
}

.app-sidebar__brand-text strong {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--spring-text);
  letter-spacing: 0.02em;
}

.app-sidebar__brand-text span {
  font-size: 0.75rem;
  color: var(--spring-muted);
}

.app-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.85rem 0.65rem 1rem;
}

.app-sidebar__group + .app-sidebar__group {
  margin-top: 1rem;
}

.app-sidebar__group-label {
  margin: 0 0 0.45rem 0.65rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spring-muted);
}

.app-sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.25rem;
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  color: var(--spring-muted);
  text-decoration: none;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.app-sidebar__link:hover {
  background: var(--spring-mint-soft);
  color: var(--spring-text);
}

.app-sidebar__link--active {
  background: var(--spring-mint-soft);
  color: var(--spring-mint-deep);
  box-shadow: inset 3px 0 0 var(--spring-mint);
}

.app-sidebar__icon {
  width: 1.1rem;
  flex-shrink: 0;
  text-align: center;
  font-size: 0.95rem;
}

.app-sidebar__label {
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.app-sidebar--collapsed .app-sidebar__link {
  justify-content: center;
  padding-inline: 0.5rem;
}

.app-sidebar__toggle {
  display: none;
  margin: 0.75rem;
  height: 2.25rem;
  border: 1px solid var(--spring-border);
  border-radius: 0.65rem;
  background: #fff;
  color: var(--spring-muted);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.app-sidebar__toggle:hover {
  border-color: var(--spring-mint);
  color: var(--spring-mint-deep);
}

.sidebar-label-enter-active,
.sidebar-label-leave-active {
  transition: opacity 0.15s ease;
}

.sidebar-label-enter-from,
.sidebar-label-leave-to {
  opacity: 0;
}

@media (min-width: 1024px) {
  .app-sidebar__toggle {
    display: grid;
    place-items: center;
  }
}

@media (max-width: 1023px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar--mobile-open {
    transform: translateX(0);
    box-shadow: 0 24px 48px rgb(42 64 54 / 0.12);
  }
}
</style>
