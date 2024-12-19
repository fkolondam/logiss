import { computed } from 'vue'
import { format, isToday, isThisWeek, isThisMonth, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

export const useDashboardData = () => {
  // Format currency with IDR
  const formatCurrency = (value) => {
    if (!value) return 'Rp 0'
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Format percentage
  const formatPercentage = (value, decimals = 0) => {
    if (typeof value !== 'number') return '0%'
    return value.toFixed(decimals) + '%'
  }

  // Format date
  const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return ''
    return format(new Date(date), formatStr, { locale: id })
  }

  // Get date range for period
  const getDateRange = (period) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (period) {
      case 'today':
        return { start: today, end: new Date() }
      case 'week':
        return { start: subDays(today, 7), end: new Date() }
      case 'month':
        return { start: subDays(today, 30), end: new Date() }
      default:
        return { start: today, end: new Date() }
    }
  }

  // Filter data by period
  const filterByPeriod = (data, dateField, period) => {
    if (!data?.length) return []
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      switch (period) {
        case 'today':
          return isToday(itemDate)
        case 'week':
          return isThisWeek(itemDate)
        case 'month':
          return isThisMonth(itemDate)
        default:
          return true
      }
    })
  }

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  // Group data by field
  const groupBy = (data, field) => {
    if (!data?.length) return {}
    
    return data.reduce((acc, item) => {
      const key = item[field]
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }

  return {
    formatCurrency,
    formatPercentage,
    formatDate,
    getDateRange,
    filterByPeriod,
    calculateTrend,
    groupBy
  }
}
