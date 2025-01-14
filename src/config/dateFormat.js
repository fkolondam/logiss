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
}

function getJakartaDate(date = new Date()) {
  // First convert to UTC by removing the local timezone offset
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  // Then add Jakarta's offset
  const jakartaTime = new Date(utc + TIMEZONE_OFFSET)

  // For debugging
  console.log('Date conversion:', {
    input: date.toISOString(),
    utc: new Date(utc).toISOString(),
    jakarta: jakartaTime.toISOString(),
    offset: date.getTimezoneOffset(),
  })

  return jakartaTime
}

function getJakartaToday() {
  const jakartaDate = getJakartaDate()
  // Reset time to midnight in Jakarta timezone
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
 * Converts a date string to the standard API format
 * @param {string} dateStr - Date string in any supported format
 * @param {string} [fromFormat] - Format of the input date string
 * @returns {string} Date string in API format
 */
export function toAPIFormat(dateStr, fromFormat = DATE_FORMATS.DISPLAY) {
  if (!dateStr) return null

  const parsedDate = parse(dateStr, fromFormat, new Date())
  if (!isValid(parsedDate)) return null

  const jakartaDate = getJakartaDate(parsedDate)
  return format(jakartaDate, DATE_FORMATS.API)
}

/**
 * Converts a date string or Date object to display format
 * @param {string|Date} date - Date string in API format or Date object
 * @returns {string} Date string in display format
 */
export function toDisplayFormat(date) {
  if (!date) return null

  let jakartaDate
  if (date instanceof Date) {
    jakartaDate = getJakartaDate(date)
  } else {
    const parsedDate = parse(date, DATE_FORMATS.API, new Date())
    if (!isValid(parsedDate)) return null
    jakartaDate = getJakartaDate(parsedDate)
  }

  return format(jakartaDate, DATE_FORMATS.DISPLAY)
}

/**
 * Validates if a date string is in the correct format
 * @param {string} dateStr - Date string to validate
 * @param {string} [expectedFormat] - Expected format of the date string
 * @returns {boolean} True if date is valid and in correct format
 */
export function isValidDateFormat(dateStr, expectedFormat = DATE_FORMATS.API) {
  if (!dateStr) return false
  const parsedDate = parse(dateStr, expectedFormat, new Date())
  return isValid(parsedDate)
}

/**
 * Gets current date in the specified format
 * @param {string} [outputFormat] - Desired output format
 * @returns {string} Current date in specified format
 */
export function getCurrentDate(outputFormat = DATE_FORMATS.API) {
  const jakartaDate = getJakartaToday()
  return format(jakartaDate, outputFormat)
}

/**
 * Converts a Date object to a formatted string
 * @param {Date} date - Date object to format
 * @param {string} [outputFormat] - Desired output format
 * @returns {string} Formatted date string
 */
export function formatDate(date, outputFormat = DATE_FORMATS.API) {
  if (!(date instanceof Date) || !isValid(date)) return null
  const jakartaDate = getJakartaDate(date)
  return format(jakartaDate, outputFormat)
}

// Export the getJakartaDate and getJakartaToday functions for use in other modules
export { getJakartaDate, getJakartaToday }
