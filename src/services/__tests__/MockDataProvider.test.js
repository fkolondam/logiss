import { describe, test, expect, beforeEach } from 'vitest'
import { MockDataProvider } from '../MockDataProvider'

describe('MockDataProvider', () => {
  let provider

  beforeEach(() => {
    provider = new MockDataProvider()
  })

  describe('fetch', () => {
    test('should fetch deliveries with limit', async () => {
      const result = await provider.fetch('deliveries', { limit: 5 })
      expect(result).toHaveLength(5)
    })

    test('should sort deliveries by date desc', async () => {
      const result = await provider.fetch('deliveries', { sort: 'date,desc' })
      for (let i = 1; i < result.length; i++) {
        const curr = new Date(result[i].date)
        const prev = new Date(result[i-1].date)
        expect(curr <= prev).toBe(true)
      }
    })

    test('should filter deliveries by status', async () => {
      const status = 'DITERIMA - SEMUA'
      const result = await provider.fetch('deliveries', { 
        filters: { status } 
      })
      result.forEach(delivery => {
        expect(delivery.status).toBe(status)
      })
    })

    test('should search deliveries', async () => {
      const searchTerm = 'mart'
      const result = await provider.fetch('deliveries', { 
        search: searchTerm 
      })
      expect(result.length).toBeGreaterThan(0)
      result.forEach(delivery => {
        const hasMatch = Object.values(delivery).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchTerm)
        )
        expect(hasMatch).toBe(true)
      })
    })

    test('should paginate deliveries', async () => {
      const page = 2
      const perPage = 10
      const result = await provider.fetch('deliveries', { page, perPage })
      expect(result.length).toBeLessThanOrEqual(perPage)
    })
  })

  describe('getExpenseStats', () => {
    test('should calculate expense stats for date range', async () => {
      const dateRange = {
        start: new Date('2024-12-01'),
        end: new Date('2024-12-31')
      }
      const stats = await provider.getExpenseStats({ dateRange })
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('count')
      expect(stats).toHaveProperty('byCategory')
      expect(stats).toHaveProperty('previousTotal')
      expect(typeof stats.total).toBe('number')
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0)
    })

    test('should handle empty date range', async () => {
      const dateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      }
      const stats = await provider.getExpenseStats({ dateRange })
      
      expect(stats.total).toBe(0)
      expect(stats.count).toBe(0)
      expect(Object.keys(stats.byCategory)).toHaveLength(0)
    })
  })

  describe('getDeliveryStats', () => {
    test('should calculate delivery stats for date range', async () => {
      const dateRange = {
        start: new Date('2024-12-01'),
        end: new Date('2024-12-31')
      }
      const stats = await provider.getDeliveryStats({ dateRange })
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('completed')
      expect(stats).toHaveProperty('partial')
      expect(stats).toHaveProperty('pending')
      expect(stats).toHaveProperty('cancelled')
      expect(stats).toHaveProperty('successRate')
      expect(typeof stats.total).toBe('number')
      expect(stats.successRate).toBeGreaterThanOrEqual(0)
      expect(stats.successRate).toBeLessThanOrEqual(100)
    })

    test('should calculate correct success rate', async () => {
      const dateRange = {
        start: new Date('2024-12-01'),
        end: new Date('2024-12-31')
      }
      const stats = await provider.getDeliveryStats({ dateRange })
      
      const expectedRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
      expect(stats.successRate).toBe(expectedRate)
    })

    test('should handle empty date range', async () => {
      const dateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      }
      const stats = await provider.getDeliveryStats({ dateRange })
      
      expect(stats.total).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.successRate).toBe(0)
    })
  })
})
