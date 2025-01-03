import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ExpensesTest from '../components/__tests__/ExpensesTest.vue'
import VehiclesTest from '../components/__tests__/VehiclesTest.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import ProfileView from '../views/ProfileView.vue'
import LogoutView from '../views/LogoutView.vue'
import GoogleSheetsTest from '../components/__tests__/GoogleSheetsTest.vue'
import { useAppStore } from '../stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/deliveries',
      name: 'deliveries',
      component: DeliveriesView,
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView,
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: VehiclesView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
    },
    {
      path: '/test/sheets',
      name: 'sheetsTest',
      component: GoogleSheetsTest,
    },
    {
      path: '/test/expenses',
      name: 'expenses-test',
      component: ExpensesTest,
    },
    {
      path: '/test/vehicles',
      name: 'vehicles-test',
      component: VehiclesTest,
    },
  ],
})

// Navigation guard to handle UI state when leaving deliveries
router.beforeEach((to, from, next) => {
  // Reset UI state when navigating away from deliveries
  if (from.name === 'deliveries' && to.name !== 'deliveries') {
    const appStore = useAppStore()
    appStore.resetUIState()
  }
  next()
})

// Error handling
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
