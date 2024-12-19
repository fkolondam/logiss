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

  // Calculate statistics
  const calculateStats = (data, options = {}) => {
    const {
      valueField = 'amount',
      categoryField = 'category',
      dateField = 'date',
      period = 'today'
    } = options

    if (!data?.length) return {
      total: 0,
      average: 0,
      categories: {},
      trend: 0
    }

    const filteredData = filterByPeriod(data, dateField, period)
    const total = filteredData.reduce((sum, item) => sum + (item[valueField] || 0), 0)
    const average = total / filteredData.length || 0
    
    const categories = filteredData.reduce((acc, item) => {
      const category = item[categoryField]
      acc[category] = (acc[category] || 0) + (item[valueField] || 0)
      return acc
    }, {})

    // Calculate trend
    const previousPeriodData = filterByPeriod(
      data,
      dateField,
      period === 'today' ? 'yesterday' : period === 'week' ? 'lastWeek' : 'lastMonth'
    )
    const previousTotal = previousPeriodData.reduce((sum, item) => sum + (item[valueField] || 0), 0)
    const trend = calculateTrend(total, previousTotal)

    return {
      total,
      average,
      categories,
      trend
    }
  }

  return {
    formatCurrency,
    formatPercentage,
    formatDate,
    getDateRange,
    filterByPeriod,
    calculateTrend,
    groupBy,
    calculateStats
  }
}
