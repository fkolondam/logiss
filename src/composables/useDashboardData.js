import { ref, computed } from 'vue'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export function useDashboardData() {
  // Period options
  const PERIODS = {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    CUSTOM: 'custom'
  }

  // Get date range based on period
  const getDateRange = (period) => {
    const now = new Date()
    
    switch (period) {
      case PERIODS.TODAY:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case PERIODS.THIS_WEEK:
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        }
      case PERIODS.THIS_MONTH:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case PERIODS.CUSTOM:
        // Custom date range should be provided separately
        return null
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
    }
  }

  // Filter data by period
  const filterByPeriod = (data, period, dateField = 'date') => {
    if (!data || !period) return data

    const range = getDateRange(period)
    if (!range) return data

    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= range.start && itemDate <= range.end
    })
  }

  // Filter data by search term
  const filterBySearch = (data, searchTerm, fields = ['id', 'name', 'description']) => {
    if (!data || !searchTerm) return data

    const term = searchTerm.toLowerCase()
    return data.filter(item => 
      fields.some(field => 
        item[field] && item[field].toString().toLowerCase().includes(term)
      )
    )
  }

  // Sort data
  const sortData = (data, { field, direction = 'asc' }) => {
    if (!data || !field) return data

    return [...data].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      if (typeof aVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return direction === 'asc' 
        ? aVal - bVal
        : bVal - aVal
    })
  }

  // Group data by field
  const groupBy = (data, field) => {
    if (!data || !field) return {}

    return data.reduce((acc, item) => {
      const key = item[field]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    }, {})
  }

  // Calculate statistics
  const calculateStats = (data, field) => {
    if (!data || !field) return null

    const values = data.map(item => Number(item[field])).filter(val => !isNaN(val))
    
    if (!values.length) return null

    return {
      total: values.reduce((sum, val) => sum + val, 0),
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }

  return {
    PERIODS,
    getDateRange,
    filterByPeriod,
    filterBySearch,
    sortData,
    groupBy,
    calculateStats
  }
}
