import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAdminToken() {
  const auth = useAuthStore()
  const router = useRouter()

  function ensureToken(): string | null {
    if (!auth.token) {
      void router.replace({ name: 'login' })
      return null
    }
    return auth.token
  }

  return { auth, router, ensureToken }
}
