// List of holidays in Q4 2024
const HOLIDAYS_2024 = [
  '2024-11-27', // Maulid Nabi Muhammad
  '2024-12-25', // Hari Pahlawan
  '2024-12-31', // Hari Natal
]

// Format date to MM/DD/YYYY string
export const formatDate = (date) => {
  if (!isValidDate(date)) return null
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

// Format date to YYYY-MM-DD string
export const formatISODate = (date) => {
  if (!isValidDate(date)) return null
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parse date string to Date object
export const parseDate = (dateString) => {
  if (!dateString) return null

  try {
    // Handle Date objects
    if (dateString instanceof Date) {
      return isValidDate(dateString) ? dateString : null
    }

    // Handle ISO format (YYYY-MM-DD)
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return isValidDate(date) ? date : null
    }

    // Handle MM/DD/YYYY format
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [month, day, year] = dateString.split('/')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return isValidDate(date) ? date : null
    }

    // Handle timestamps
    if (typeof dateString === 'number') {
      const date = new Date(dateString)
      return isValidDate(date) ? date : null
    }

    return null
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return null
  }
}

// Validate date object
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime())
}

// Check if date is a holiday
export const isHoliday = (date) => {
  if (!isValidDate(date)) return false
  const isoDate = formatISODate(date)
  return HOLIDAYS_2024.includes(isoDate)
}

// Check if date is a weekend (Sunday)
export const isWeekend = (date) => {
  if (!isValidDate(date)) return false
  return date.getDay() === 0 // 0 = Sunday
}

// Check if date is a working day
export const isWorkingDay = (date) => {
  if (!isValidDate(date)) return false
  return !isWeekend(date) && !isHoliday(date)
}

// Get Q4 2024 date range
export const getQ4DateRange = () => {
  const start = new Date(2024, 9, 1) // October 1, 2024
  const end = new Date(2024, 11, 31) // December 31, 2024
  return { start, end }
}

// Ensure date is in Q4 2024
export const ensureQ4Date = (date) => {
  if (!isValidDate(date)) return null

  const { start, end } = getQ4DateRange()
  if (date < start) return start
  if (date > end) return end
  return date
}

// Get working days (Monday-Saturday, excluding holidays) in date range
export const getWorkingDaysInRange = (start, end) => {
  if (!isValidDate(start) || !isValidDate(end)) {
    console.warn('Invalid date range for getWorkingDaysInRange')
    return []
  }

  const days = []
  const current = new Date(start)

  while (current <= end) {
    if (isWorkingDay(current)) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

// Get start of month
export const startOfMonth = (date) => {
  if (!isValidDate(date)) return null
  const start = new Date(date)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  return start
}

// Get end of month
export const endOfMonth = (date) => {
  if (!isValidDate(date)) return null
  const end = new Date(date)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  end.setHours(23, 59, 59, 999)
  return end
}

// Get start of week (Monday)
export const startOfWeek = (date) => {
  if (!isValidDate(date)) return null
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

// Get end of week (Sunday)
export const endOfWeek = (date) => {
  if (!isValidDate(date)) return null
  const end = new Date(date)
  const day = end.getDay()
  const diff = end.getDate() + (day === 0 ? 0 : 7 - day)
  end.setDate(diff)
  end.setHours(23, 59, 59, 999)
  return end
}

// Get start of day
export const startOfDay = (date) => {
  if (!isValidDate(date)) return null
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

// Get end of day
export const endOfDay = (date) => {
  if (!isValidDate(date)) return null
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

// Get previous period
export const getPreviousPeriod = (date, period = 'month') => {
  if (!isValidDate(date)) return null
  const start = new Date(date)

  switch (period) {
    case 'month':
      start.setMonth(start.getMonth() - 1)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      break
    case 'day':
      start.setDate(start.getDate() - 1)
      break
    default:
      throw new Error(`Invalid period: ${period}`)
  }

  return start
}

// Format date range for display
export const formatDateRange = (start, end) => {
  if (!isValidDate(start) || !isValidDate(end)) return ''
  return `${formatDate(start)} - ${formatDate(end)}`
}

// Check if date is end of month
export const isEndOfMonth = (date) => {
  if (!isValidDate(date)) return false
  const end = endOfMonth(date)
  return date.getDate() === end.getDate()
}

// Check if date is end of week
export const isEndOfWeek = (date) => {
  if (!isValidDate(date)) return false
  return date.getDay() === 6 // Saturday
}

// Get working days in month
export const getWorkingDaysInMonth = (date) => {
  if (!isValidDate(date)) return []
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return getWorkingDaysInRange(start, end)
}

// Get working days in week
export const getWorkingDaysInWeek = (date) => {
  if (!isValidDate(date)) return []
  const start = startOfWeek(date)
  const end = endOfWeek(date)
  return getWorkingDaysInRange(start, end)
}

// Get date range for period
export const getDateRangeForPeriod = (date, period = 'month') => {
  if (!isValidDate(date)) return null

  switch (period) {
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    case 'week':
      return {
        start: startOfWeek(date),
        end: endOfWeek(date),
      }
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }
    default:
      throw new Error(`Invalid period: ${period}`)
  }
}

// Get previous period range
export const getPreviousPeriodRange = (date, period = 'month') => {
  if (!isValidDate(date)) return null
  const previousDate = getPreviousPeriod(date, period)
  return getDateRangeForPeriod(previousDate, period)
}

// Format time (HH:MM AM/PM)
export const formatTime = (date) => {
  if (!isValidDate(date)) return null
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12
  return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

// Get random time in working hours (8 AM - 5 PM)
export const getRandomTimeInWorkingHours = () => {
  const hours = Math.floor(Math.random() * 9) + 8 // 8 AM - 5 PM
  const minutes = Math.floor(Math.random() * 60)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return formatTime(date)
}

// Get random working time for delivery
export const getRandomWorkingTime = (index, total) => {
  if (typeof index !== 'number' || typeof total !== 'number' || total === 0) {
    return getRandomTimeInWorkingHours()
  }

  // Distribute deliveries evenly throughout the day (8 AM - 5 PM)
  const timeSlot = 9 * (index / total) // 9 hours
  const hour = Math.floor(timeSlot) + 8 // Start from 8 AM
  const minute = Math.floor((timeSlot % 1) * 60)
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return formatTime(date)
}
