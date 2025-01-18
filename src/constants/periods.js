import {
  getJakartaToday,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getMondayOfWeek,
  toAPIFormat,
} from '../config/dateFormat'

export const PERIODS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  L3M: 'last_three_months',
  YTD: 'year_to_date',
  CUSTOM_RANGE: 'custom_range',
}

export const PERIOD_LABELS = {
  [PERIODS.TODAY]: 'Today',
  [PERIODS.THIS_WEEK]: 'This Week',
  [PERIODS.THIS_MONTH]: 'This Month',
  [PERIODS.LAST_MONTH]: 'Last Month',
  [PERIODS.L3M]: 'Last 3 Months',
  [PERIODS.YTD]: 'Year to Date',
  [PERIODS.CUSTOM_RANGE]: 'Custom Range',
}

/**
 * Get date range for a given period
 * @param {string} period - Period from PERIODS constant
 * @param {Array} customRange - Optional custom date range [startDate, endDate]
 * @returns {Object} { start: Date, end: Date } - Start and end dates in Jakarta timezone
 */
export function getDateRangeForPeriod(period, customRange = null) {
  const today = getJakartaToday()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  let dateRange = { start: today, end: today }

  switch (period) {
    case PERIODS.TODAY: {
      dateRange = {
        start: today,
        end: today,
      }
      break
    }

    case PERIODS.THIS_WEEK: {
      dateRange = {
        start: getMondayOfWeek(today),
        end: today,
      }
      break
    }

    case PERIODS.THIS_MONTH: {
      dateRange = {
        start: getFirstDayOfMonth(currentYear, currentMonth),
        end: today,
      }
      break
    }

    case PERIODS.LAST_MONTH: {
      dateRange = {
        start: getFirstDayOfMonth(currentYear, currentMonth - 1),
        end: getLastDayOfMonth(currentYear, currentMonth - 1),
      }
      break
    }

    case PERIODS.L3M: {
      // Last three months (excluding current month)
      // Example: If current month is January (0):
      // - End month should be December (11)
      // - Start month should be October (9)
      const endMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const startMonth = endMonth - 2

      // Calculate years
      const endYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const startYear = startMonth < 0 ? endYear - 1 : endYear

      // Adjust negative months
      const adjustedStartMonth = startMonth < 0 ? startMonth + 12 : startMonth

      dateRange = {
        start: getFirstDayOfMonth(startYear, adjustedStartMonth),
        end: getLastDayOfMonth(endYear, endMonth),
      }
      break
    }

    case PERIODS.YTD: {
      dateRange = {
        start: getFirstDayOfMonth(currentYear, 0), // January 1st
        end: today,
      }
      break
    }

    case PERIODS.CUSTOM_RANGE: {
      if (customRange?.length === 2) {
        const [startDate, endDate] = customRange
        dateRange = {
          start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
          end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
        }
      }
      break
    }
  }

  // Log the calculated date range
  console.log('Date range calculation:', {
    period,
    range: {
      start: toAPIFormat(dateRange.start),
      end: toAPIFormat(dateRange.end),
    },
    today: toAPIFormat(today),
  })

  return dateRange
}

/**
 * Format date range for API
 * @param {Object} dateRange - { start: Date, end: Date }
 * @returns {Object} { start: string, end: string } - Formatted dates in YYYY-MM-DD format
 */
export function formatDateRange(dateRange) {
  return {
    start: toAPIFormat(dateRange.start),
    end: toAPIFormat(dateRange.end),
  }
}

/**
 * Get previous period's date range
 * @param {Object} currentRange - Current date range { start: Date, end: Date }
 * @returns {Object} { start: Date, end: Date } - Previous period's date range
 */
export function getPreviousPeriodRange(currentRange) {
  const duration = currentRange.end.getTime() - currentRange.start.getTime()
  return {
    start: new Date(currentRange.start.getTime() - duration),
    end: new Date(currentRange.end.getTime() - duration),
  }
}
