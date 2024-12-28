import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../../stores/user'
import { useDeliveriesData } from '../../composables/useDeliveriesData'
import { PERIODS } from '../../constants/periods'

// Mock components
const mockUserSelector = {
  template: '<div class="user-selector">{{ currentUser?.name }}</div>',
  computed: {
    currentUser() {
      return this.$store.user.currentUser
    },
  },
}

const mockScopeSelector = {
  template: '<div class="scope-selector">{{ currentScope }}</div>',
  props: ['modelValue'],
  computed: {
    currentScope() {
      return this.modelValue
    },
  },
}

const mockTimeline = {
  template: '<div class="timeline">{{ period }}</div>',
  props: ['period'],
}

describe('Data Context Flow', () => {
  let wrapper
  let userStore

  beforeEach(() => {
    // Create a fresh Pinia instance
    setActivePinia(createPinia())
    userStore = useUserStore()
  })

  describe('User Context Changes', () => {
    it('should update scope data when user changes', async () => {
      const globalAdmin = {
        id: 'admin1',
        name: 'Global Admin',
        role: 'admin',
        scope: { type: 'global' },
      }

      const regionalManager = {
        id: 'rm1',
        name: 'Regional Manager',
        role: 'regional_manager',
        scope: { type: 'region', value: 'JAWA BARAT' },
      }

      // Switch to global admin
      await userStore.switchUser(globalAdmin.id)
      expect(userStore.currentUser.scope.type).toBe('global')

      // Verify available scopes for global admin
      const { availableScopes } = useDeliveriesData()
      expect(availableScopes.value).toContain('global')

      // Switch to regional manager
      await userStore.switchUser(regionalManager.id)
      expect(userStore.currentUser.scope.type).toBe('region')
      expect(userStore.currentUser.scope.value).toBe('JAWA BARAT')

      // Verify available scopes are limited to user's region
      expect(availableScopes.value).not.toContain('global')
      expect(availableScopes.value).toContain('JAWA BARAT')
    })

    it('should maintain timeline period across user switches', async () => {
      const { period } = useDeliveriesData()

      // Set initial period
      period.value = PERIODS.THIS_WEEK

      // Switch users
      await userStore.switchUser('admin1')
      expect(period.value).toBe(PERIODS.THIS_WEEK)

      await userStore.switchUser('rm1')
      expect(period.value).toBe(PERIODS.THIS_WEEK)
    })
  })

  describe('Scope Context Changes', () => {
    it('should filter data based on selected scope', async () => {
      const { currentScope, deliveriesData } = useDeliveriesData()

      // Set user as regional manager
      await userStore.switchUser('rm1')

      // Change scope to specific branch
      currentScope.value = 'BANDUNG_01'

      // Verify deliveries are filtered by branch
      expect(deliveriesData.value.every((d) => d.branch === 'BANDUNG_01')).toBe(true)
    })

    it('should reset to default scope when switching users', async () => {
      const { currentScope } = useDeliveriesData()

      // Set initial scope for regional manager
      await userStore.switchUser('rm1')
      currentScope.value = 'BANDUNG_01'

      // Switch to global admin
      await userStore.switchUser('admin1')

      // Verify scope reset to global
      expect(currentScope.value).toBe('global')
    })
  })

  describe('Timeline Context Changes', () => {
    it('should maintain scope when changing timeline period', async () => {
      const { currentScope, period } = useDeliveriesData()

      // Set initial state
      await userStore.switchUser('rm1')
      currentScope.value = 'BANDUNG_01'

      // Change period
      period.value = PERIODS.THIS_MONTH

      // Verify scope maintained
      expect(currentScope.value).toBe('BANDUNG_01')
    })

    it('should filter data by both scope and period', async () => {
      const { currentScope, period, deliveriesData } = useDeliveriesData()

      // Set context
      await userStore.switchUser('rm1')
      currentScope.value = 'BANDUNG_01'
      period.value = PERIODS.THIS_WEEK

      // Verify data filtered by both scope and period
      const thisWeekStart = new Date()
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())

      expect(
        deliveriesData.value.every((d) => {
          const deliveryDate = new Date(d.date)
          return d.branch === 'BANDUNG_01' && deliveryDate >= thisWeekStart
        }),
      ).toBe(true)
    })
  })
})
