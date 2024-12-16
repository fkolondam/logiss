import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import ProfileView from '../views/ProfileView.vue'
import LogoutView from '../views/LogoutView.vue'
import { useAppStore } from '../stores/app'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/deliveries',
    name: 'deliveries',
    component: DeliveriesView,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      next()
    }
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView
  },
  {
    path: '/vehicles',
    name: 'vehicles',
    component: VehiclesView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // Reset UI state when navigating away from deliveries
  if (from.name === 'deliveries' && to.name !== 'deliveries') {
    const appStore = useAppStore()
    appStore.resetUIState()
  }
  next()
})

// Error handling
router.onError((error: Error) => {
  console.error('Router error:', error)
})

export default router
