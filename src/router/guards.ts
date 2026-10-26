import type { Router } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

export function setupGuards(router: Router): void {
  router.beforeEach((to) => {
    const user = useUserStore();
    const needsAuth = to.matched.some((record) => record.meta.requiresAuth === true);

    if (needsAuth && !user.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    if (to.path === '/login' && user.isAuthenticated) {
      return { path: '/' };
    }

    return true;
  });
}
