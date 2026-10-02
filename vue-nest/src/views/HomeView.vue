<script setup lang="ts">
import { computed } from 'vue'
import { getMenuGroups } from '@/config/menu'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const quickLinks = computed(() =>
  getMenuGroups()
    .flatMap((group) => group.items)
    .filter((item) => item.key !== 'home'),
)
</script>

<template>
  <div class="home-dashboard">
    <section class="home-hero">
      <div class="home-hero__copy">
        <p class="home-hero__tag">工作台</p>
        <h2>{{ greeting }}，{{ auth.user?.name ?? '用户' }}</h2>
        <p class="home-hero__desc">
          从这里进入业务模块与系统管理。侧栏菜单会根据配置动态加载，可随时收起以腾出空间。
        </p>
      </div>
      <div class="home-hero__badge" aria-hidden="true">
        <span>05</span>
        <small>May</small>
      </div>
    </section>

    <section class="home-stats">
      <article class="home-stat">
        <p class="home-stat__label">账号 ID</p>
        <p class="home-stat__value">{{ auth.user?.id ?? '—' }}</p>
      </article>
      <article class="home-stat">
        <p class="home-stat__label">登录邮箱</p>
        <p class="home-stat__value home-stat__value--truncate">{{ auth.user?.email ?? '—' }}</p>
      </article>
      <article class="home-stat home-stat--accent">
        <p class="home-stat__label">可用模块</p>
        <p class="home-stat__value">{{ quickLinks.length + 1 }}</p>
      </article>
    </section>

    <section class="home-section">
      <div class="home-section__head">
        <h3>快捷入口</h3>
        <p>常用功能一键直达</p>
      </div>
      <div class="home-grid">
        <RouterLink
          v-for="item in quickLinks"
          :key="item.key"
          :to="item.to"
          class="home-card"
        >
          <span class="home-card__icon">
            <i :class="item.icon" />
          </span>
          <div class="home-card__body">
            <strong>{{ item.label }}</strong>
            <span>{{ item.description ?? '进入模块' }}</span>
          </div>
          <i class="pi pi-arrow-right home-card__arrow" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-dashboard {
  display: grid;
  gap: 1.25rem;
}

.home-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.4rem;
  border: 1px solid var(--spring-border);
  border-radius: 1.1rem;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.92), rgb(232 245 239 / 0.72));
  box-shadow: 0 18px 40px rgb(109 184 154 / 0.08);
}

.home-hero__tag {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spring-mint-deep);
}

.home-hero h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 700;
  color: var(--spring-text);
}

.home-hero__desc {
  margin: 0.65rem 0 0;
  max-width: 36rem;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--spring-muted);
}

.home-hero__badge {
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 1rem;
  background: linear-gradient(160deg, var(--spring-pink-soft), #fff);
  border: 1px solid rgb(244 169 184 / 0.35);
  color: var(--spring-pink-deep);
  text-align: center;
}

.home-hero__badge span {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1;
}

.home-hero__badge small {
  margin-top: 0.15rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-stats {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-stat {
  padding: 1rem 1.1rem;
  border: 1px solid var(--spring-border);
  border-radius: 0.95rem;
  background: rgb(255 255 255 / 0.78);
}

.home-stat--accent {
  background: linear-gradient(145deg, rgb(232 245 239 / 0.95), rgb(255 255 255 / 0.9));
}

.home-stat__label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--spring-muted);
}

.home-stat__value {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--spring-text);
}

.home-stat__value--truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-section__head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--spring-text);
}

.home-section__head p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--spring-muted);
}

.home-grid {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.85rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.home-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--spring-border);
  border-radius: 0.95rem;
  background: rgb(255 255 255 / 0.82);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.home-card:hover {
  transform: translateY(-2px);
  border-color: rgb(109 184 154 / 0.45);
  box-shadow: 0 14px 28px rgb(109 184 154 / 0.1);
}

.home-card__icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: var(--spring-mint-soft);
  color: var(--spring-mint-deep);
}

.home-card__body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
}

.home-card__body strong {
  font-size: 0.92rem;
  color: var(--spring-text);
}

.home-card__body span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  color: var(--spring-muted);
}

.home-card__arrow {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--spring-mint);
}

@media (max-width: 768px) {
  .home-stats {
    grid-template-columns: 1fr;
  }

  .home-hero__badge {
    display: none;
  }
}
</style>
