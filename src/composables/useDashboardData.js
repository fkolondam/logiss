import { ref, computed } from 'vue'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
  isValid,
} from 'date-fns'

export function useDashboardData() {
  // Generic period options that work with any data timeframe
  const PERIODS = {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    CUSTOM: 'custom',
  }

  // Format date to MM/DD/YYYY string (matches MockDataProvider format)
  const formatDate = (date) => {
    if (!date || !isValid(date)) {
      console.warn('Invalid date:', date)
      return null
    }
    try {
      return format(date, 'MM/dd/yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return null
    }
  }

  // Parse date string (MM/DD/YYYY) to Date object
  const parseDate = (dateString) => {
    if (!dateString) {
      console.warn('No date string provided')
      return null
    }

    try {
      // Handle Date objects
      if (dateString instanceof Date) {
        return isValid(dateString) ? dateString : null
      }

      // Handle ISO format (YYYY-MM-DD)
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const date = parseISO(dateString)
        return isValid(date) ? date : null
      }

      // Handle MM/DD/YYYY format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [month, day, year] = dateString.split('/')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return isValid(date) ? date : null
      }

      // Handle timestamps
      if (typeof dateString === 'number') {
        const date = new Date(dateString)
        return isValid(date) ? date : null
      }

      console.warn('Unsupported date format:', dateString)
      return null
    } catch (error) {
      console.error('Error parsing date:', dateString, error)
      return null
    }
  }

  // Get date range based on period relative to current date
  const getDateRange = (period = PERIODS.THIS_MONTH) => {
    try {
      console.log('Getting date range for period:', period)
      const now = new Date()

      // Default to current month if period is invalid
      if (!period || !Object.values(PERIODS).includes(period)) {
        console.warn('Invalid period, defaulting to THIS_MONTH')
        period = PERIODS.THIS_MONTH
      }

      let start, end
      switch (period) {
        case PERIODS.TODAY:
          start = startOfDay(now)
          end = endOfDay(now)
          break
        case PERIODS.THIS_WEEK:
          start = startOfWeek(now)
          end = endOfWeek(now)
          break
        case PERIODS.THIS_MONTH:
          start = startOfMonth(now)
          end = endOfMonth(now)
          break
        case PERIODS.CUSTOM:
          // Custom date range should be provided separately
          console.warn('Custom period requires explicit date range')
          return null
        default:
          start = startOfMonth(now)
          end = endOfMonth(now)
      }

      // Format dates to match MockDataProvider format (MM/DD/YYYY)
      const formattedStart = formatDate(start)
      const formattedEnd = formatDate(end)

      // Validate dates
      if (!formattedStart || !formattedEnd) {
        console.error('Invalid date range generated for period:', period)
        return null
      }

      console.log('Generated date range:', formattedStart, 'to', formattedEnd)
      return {
        start: formattedStart,
        end: formattedEnd,
        displayRange: `${formattedStart} - ${formattedEnd}`,
      }
    } catch (error) {
      console.error('Error getting date range:', error)
      return null
    }
  }

  // Get previous period range for comparison
  const getPreviousPeriodRange = (period) => {
    try {
      console.log('Getting previous period range for:', period)
      const currentRange = getDateRange(period)
      if (!currentRange) {
        console.warn('No current range available')
        return null
      }

      const start = parseDate(currentRange.start)
      const end = parseDate(currentRange.end)
      if (!start || !end) {
        console.warn('Invalid current range dates')
        return null
      }

      let previousStart, previousEnd
      switch (period) {
        case PERIODS.TODAY:
        case PERIODS.THIS_WEEK:
          previousStart = subMonths(start, 0)
          previousEnd = subMonths(end, 0)
          break
        case PERIODS.THIS_MONTH:
          previousStart = subMonths(start, 1)
          previousEnd = subMonths(end, 1)
          break
        default:
          return currentRange
      }

      // Format dates to match MockDataProvider format (MM/DD/YYYY)
      const formattedStart = formatDate(previousStart)
      const formattedEnd = formatDate(previousEnd)

      // Validate dates
      if (!formattedStart || !formattedEnd) {
        console.error('Invalid previous date range generated for period:', period)
        return null
      }

      console.log('Generated previous range:', formattedStart, 'to', formattedEnd)
      return {
        start: formattedStart,
        end: formattedEnd,
        displayRange: `${formattedStart} - ${formattedEnd}`,
      }
    } catch (error) {
      console.error('Error getting previous period range:', error)
      return null
    }
  }

  // Filter data by period
  const filterByPeriod = (data, period, dateField = 'date') => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Invalid data array:', data)
        return []
      }

      if (!data.length) {
        console.log('Empty data array')
        return []
      }

      const range = getDateRange(period)
      if (!range) {
        console.warn('No date range available')
        return data
      }

      const startDate = parseDate(range.start)
      const endDate = parseDate(range.end)
      if (!startDate || !endDate) {
        console.warn('Invalid range dates')
        return data
      }

      console.log('Filtering data for period:', range.displayRange)
      return data.filter((item) => {
        const itemDate = parseDate(item[dateField])
        return itemDate && itemDate >= startDate && itemDate <= endDate
      })
    } catch (error) {
      console.error('Error filtering by period:', error)
      return []
    }
  }

  // Filter data by search term
  const filterBySearch = (data, searchTerm, fields = ['id', 'name', 'description']) => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Invalid data array:', data)
        return []
      }

      if (!data.length || !searchTerm) {
        return data
      }

      console.log('Filtering data by search term:', searchTerm)
      const term = searchTerm.toString().toLowerCase()
      return data.filter((item) =>
        fields.some((field) => {
          const value = item[field]
          return value != null && value.toString().toLowerCase().includes(term)
        }),
      )
    } catch (error) {
      console.error('Error filtering by search:', error)
      return []
    }
  }

  // Sort data with type checking
  const sortData = (data, { field, direction = 'asc' }) => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Invalid data array:', data)
        return []
      }

      if (!data.length || !field) {
        return data
      }

      console.log('Sorting data by:', field, direction)
      return [...data].sort((a, b) => {
        const aVal = a[field]
        const bVal = b[field]

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return direction === 'asc' ? -1 : 1
        if (bVal == null) return direction === 'asc' ? 1 : -1

        // Handle dates
        if (field === 'date') {
          const dateA = parseDate(aVal)
          const dateB = parseDate(bVal)
          if (dateA && dateB) {
            return direction === 'asc'
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime()
          }
        }

        // Sort based on type
        if (typeof aVal === 'string') {
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }

        return direction === 'asc' ? aVal - bVal : bVal - aVal
      })
    } catch (error) {
      console.error('Error sorting data:', error)
      return []
    }
  }

  // Group data by field
  const groupBy = (data, field) => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Invalid data array:', data)
        return {}
      }

      if (!data.length || !field) {
        return {}
      }

      console.log('Grouping data by:', field)
      return data.reduce((acc, item) => {
        const key = item[field]
        if (key == null) return acc

        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(item)
        return acc
      }, {})
    } catch (error) {
      console.error('Error grouping data:', error)
      return {}
    }
  }

  // Calculate statistics
  const calculateStats = (data, field) => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Invalid data array:', data)
        return null
      }

      if (!data.length || !field) {
        return null
      }

      console.log('Calculating stats for:', field)
      const values = data.map((item) => Number(item[field])).filter((val) => !isNaN(val))
      if (!values.length) {
        console.warn('No valid numeric values found')
        return null
      }

      const sum = values.reduce((acc, val) => acc + val, 0)
      const sortedValues = [...values].sort((a, b) => a - b)

      return {
        total: sum,
        average: sum / values.length,
        min: sortedValues[0],
        max: sortedValues[sortedValues.length - 1],
        count: values.length,
        median: sortedValues[Math.floor(sortedValues.length / 2)],
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      return null
    }
  }

  return {
    PERIODS,
    getDateRange,
    getPreviousPeriodRange,
    filterByPeriod,
    filterBySearch,
    sortData,
    groupBy,
    calculateStats,
    formatDate,
    parseDate,
  }
}
