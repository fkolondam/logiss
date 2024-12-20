// Format date to ISO string for internal use
export function formatDateISO(date) {
  return date.toISOString().split('T')[0]
}

// Format date to MM/DD/YY for display and test compatibility
export function formatDate(date) {
  // Ensure we're working with a Date object
  const d = date instanceof Date ? new Date(date) : new Date(date)
  // Set to noon UTC to avoid timezone issues
  d.setUTCHours(12, 0, 0, 0)

  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const year = d.getUTCFullYear() % 100 // Get last two digits of year

  // Format as MM/DD/YY
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`
}

// Parse date string in MM/DD/YY format
export function parseDate(dateStr) {
  if (!dateStr) return null
  const [month, day, year] = dateStr.split('/').map(Number)
  if (!month || !day || !year) return null

  // Assume 20xx for two-digit years
  const fullYear = year < 100 ? 2000 + year : year

  // Create date at noon UTC to avoid timezone issues
  const date = new Date(Date.UTC(fullYear, month - 1, day, 12))

  // Ensure the date is in Q4 2024 before returning
  return ensureQ4Date(date)
}

// Get working days in range (excluding weekends and holidays)
export function getWorkingDaysInRange(start, end) {
  const days = []
  const current = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 12))
  const endDate = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 12))

  while (current <= endDate) {
    if (isWorkingDay(current)) {
      days.push(new Date(current))
    }
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return days
}

// Check if date is a weekend
export function isWeekend(date) {
  return date.getUTCDay() === 0 || date.getUTCDay() === 6 // 0 = Sunday, 6 = Saturday
}

// Check if date is a holiday
export function isHoliday(date) {
  const holidays = [
    '2024-11-27', // Hari Pilkada Nasional
    '2024-12-25', // Natal
    '2024-12-31', // Tahun Baru
  ]
  const dateStr = formatDateISO(date)
  return holidays.includes(dateStr)
}

// Check if date is a working day
export function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date)
}

// Get random time in working hours (8 AM - 5 PM)
export function getRandomTimeInWorkingHours() {
  const hour = Math.floor(Math.random() * 9) + 8 // 8 AM - 5 PM
  const minute = Math.floor(Math.random() * 60)
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

// Ensure date is in Q4 2024
export function ensureQ4Date(date) {
  if (!date) return new Date(Date.UTC(2024, 9, 1, 12)) // October 1, 2024

  const q4Start = new Date(Date.UTC(2024, 9, 1, 12)) // October 1, 2024
  const q4End = new Date(Date.UTC(2024, 11, 31, 12)) // December 31, 2024

  const d = new Date(date)
  d.setUTCHours(12, 0, 0, 0)

  // Always set year to 2024
  d.setUTCFullYear(2024)

  // Ensure month is in Q4 (Oct-Dec)
  const month = d.getUTCMonth()
  if (month < 9) {
    // Before October
    d.setUTCMonth(9)
    d.setUTCDate(1)
  } else if (month > 11) {
    // After December
    d.setUTCMonth(11)
    d.setUTCDate(31)
  }

  // Ensure date is within Q4 bounds
  const time = d.getTime()
  if (time < q4Start.getTime()) {
    return new Date(q4Start)
  }
  if (time > q4End.getTime()) {
    return new Date(q4End)
  }

  // Return a new Date object to avoid mutations
  return new Date(Date.UTC(2024, d.getUTCMonth(), d.getUTCDate(), 12))
}

// Get date range for Q4 2024
export function getQ4DateRange() {
  return {
    start: new Date(Date.UTC(2024, 9, 1, 12)), // October 1, 2024 at noon UTC
    end: new Date(Date.UTC(2024, 11, 31, 12)), // December 31, 2024 at noon UTC
  }
}
