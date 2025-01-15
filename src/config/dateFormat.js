import { format, parse, isValid } from 'date-fns'

// Default timezone configuration
export const DEFAULT_TIMEZONE = 'Asia/Jakarta'

// Timezone offset for Asia/Jakarta (GMT+7)
const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

// Standard date formats
export const DATE_FORMATS = {
  // Format for display (e.g. UI components)
  DISPLAY: 'dd/MM/yyyy',
  // Format for API/Storage
  API: 'yyyy-MM-dd',
  // Format for full datetime
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  // Format for mobile display
  MOBILE: 'MMM d, yyyy',
}

/**
 * Convert any date to Jakarta timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date in Jakarta timezone
 */
export function getJakartaDate(date = new Date()) {
  const inputDate = date instanceof Date ? date : new Date(date)
  // Convert to UTC by removing the local timezone offset
  const utc = inputDate.getTime() + inputDate.getTimezoneOffset() * 60000
  // Add Jakarta's offset
  return new Date(utc + TIMEZONE_OFFSET)
}

/**
 * Get today's date in Jakarta timezone (midnight)
 * @returns {Date} Today's date in Jakarta timezone
 */
export function getJakartaToday() {
  const jakartaDate = getJakartaDate()
  // Reset time to midnight
  return new Date(
    jakartaDate.getFullYear(),
    jakartaDate.getMonth(),
    jakartaDate.getDate(),
    0,
    0,
    0,
    0,
  )
}

/**
 * Format a date for API use (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function toAPIFormat(date) {
  if (!date) return null
  const jakartaDate = getJakartaDate(date)
  return format(jakartaDate, DATE_FORMATS.API)
}

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function toDisplayFormat(date) {
  if (!date) return null
  const jakartaDate = getJakartaDate(date)
  return format(jakartaDate, DATE_FORMATS.DISPLAY)
}

/**
 * Format a date for mobile display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function toMobileFormat(date) {
  if (!date) return null
  const jakartaDate = getJakartaDate(date)
  return format(jakartaDate, DATE_FORMATS.MOBILE)
}

/**
 * Get the first day of a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Date} First day of the month
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1, 0, 0, 0, 0)
}

/**
 * Get the last day of a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Date} Last day of the month
 */
export function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

/**
 * Get the Monday of the current week
 * @param {Date} date - Reference date
 * @returns {Date} Monday of the week
 */
export function getMondayOfWeek(date) {
  const d = getJakartaDate(date)
  const day = d.getDay() || 7
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1))
  }
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Parse a date string in any supported format
 * @param {string} dateStr - Date string
 * @param {string} format - Expected format
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateStr, format = DATE_FORMATS.API) {
  if (!dateStr) return null
  const parsedDate = parse(dateStr, format, new Date())
  return isValid(parsedDate) ? parsedDate : null
}

/**
 * Validate if a date string matches the expected format
 * @param {string} dateStr - Date string to validate
 * @param {string} format - Expected format
 * @returns {boolean} True if valid
 */
export function isValidDateFormat(dateStr, format = DATE_FORMATS.API) {
  if (!dateStr) return false
  const parsedDate = parse(dateStr, format, new Date())
  return isValid(parsedDate)
}

/**
 * Get current date in the specified format
 * @param {string} format - Desired format
 * @returns {string} Formatted current date
 */
export function getCurrentDate(format = DATE_FORMATS.API) {
  return format(getJakartaToday(), format)
}

/**
 * Compare two dates (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  const d1 = getJakartaDate(date1)
  const d2 = getJakartaDate(date2)

  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)

  return d1.getTime() - d2.getTime()
}

/**
 * Check if a date is between two other dates (inclusive)
 * @param {Date} date - Date to check
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {boolean} True if date is between start and end
 */
export function isDateBetween(date, start, end) {
  const d = getJakartaDate(date)
  const s = getJakartaDate(start)
  const e = getJakartaDate(end)

  d.setHours(0, 0, 0, 0)
  s.setHours(0, 0, 0, 0)
  e.setHours(23, 59, 59, 999)

  return d >= s && d <= e
}
