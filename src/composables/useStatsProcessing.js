// Timezone offset for Asia/Jakarta (GMT+7)
const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

function getJakartaDate(date = new Date()) {
  // Convert to Jakarta time
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + TIMEZONE_OFFSET)
}

export function processDeliveryStats(result) {
  if (!result?.data) {
    console.warn('No delivery data available')
    return {
      total: 0,
      'diterima - semua': 0,
      'diterima - sebagian': 0,
      'minta kirim ulang': 0,
      batal: 0,
      byStatus: {},
      byPaymentMethod: {
        tunai: 0,
        kredit: 0,
      },
      trend: 0,
      completionTrend: 0,
      completionRate: 0,
      period: null,
    }
  }

  const stats = {
    total: result.total || result.data.length,
    'diterima - semua': 0,
    'diterima - sebagian': 0,
    'minta kirim ulang': 0,
    batal: 0,
    byStatus: {},
    byPaymentMethod: {
      tunai: 0,
      kredit: 0,
    },
    trend: 0,
    completionTrend: 0,
    completionRate: 0,
    period: result.period || null,
  }

  result.data.forEach((delivery) => {
    try {
      const status = delivery.status?.trim().toLowerCase()
      if (status) {
        if (status === 'minta kirim ulang') {
          stats['minta kirim ulang']++
        } else if (stats.hasOwnProperty(status)) {
          stats[status]++
        }
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
        if (status.startsWith('batal')) {
          stats['batal']++
        }
      }

      const paymentMethod = delivery.paymentMethod?.trim().toLowerCase()
      if (paymentMethod === 'tunai') {
        stats.byPaymentMethod.tunai++
      } else if (paymentMethod === 'kredit') {
        stats.byPaymentMethod.kredit++
      }
    } catch (error) {
      console.error('Error processing delivery:', error)
    }
  })

  stats.completionRate =
    stats.total > 0 ? Math.round((stats['diterima - semua'] / stats.total) * 100) : 0
  stats.metadata = {
    ...result.metadata,
    timestamp: getJakartaDate().toISOString(),
  }

  // Log only summary statistics
  console.log('Delivery stats summary:', {
    total: stats.total,
    'diterima - semua': stats['diterima - semua'],
    'diterima - sebagian': stats['diterima - sebagian'],
    'minta kirim ulang': stats['minta kirim ulang'],
    batal: stats.batal,
    dateRange: result.metadata?.dateRange,
    period: result.period,
  })

  return stats
}

export function processExpenseStats(result) {
  if (!result?.data) {
    console.warn('No expense data available')
    return {
      total: 0,
      totalAmount: 0,
      byCategory: {},
      trend: 0,
      metadata: {},
    }
  }

  const stats = {
    total: result.total || result.data.length,
    totalAmount: 0,
    byCategory: {},
    trend: 0,
    metadata: {
      ...result.metadata,
      timestamp: getJakartaDate().toISOString(),
    },
  }

  result.data.forEach((expense) => {
    try {
      const amount = expense.amount || 0
      stats.totalAmount += amount

      const component = expense.component?.trim() || 'Uncategorized'
      if (!stats.byCategory[component]) {
        stats.byCategory[component] = {
          count: 0,
          amount: 0,
          trend: 0,
        }
      }
      stats.byCategory[component].count++
      stats.byCategory[component].amount += amount
    } catch (error) {
      console.error('Error processing expense:', error)
    }
  })

  // Log only summary statistics
  console.log('Expense stats summary:', {
    total: stats.total,
    totalAmount: stats.totalAmount,
    categoryCount: Object.keys(stats.byCategory).length,
    dateRange: result.metadata?.dateRange,
    period: result.period,
    source: result.metadata?.source,
  })

  return stats
}

export function processVehicleStats(result) {
  if (!result?.data) {
    console.warn('No vehicle data available')
    return {
      total: 0,
      active: 0,
      maintenance: 0,
      byFunction: {},
      byLogisticType: {},
      byOwnership: {},
      documentExpiry: {
        stnk: { thisMonth: 0, nextThreeMonths: 0, expiringSoon: [] },
        tax: { thisMonth: 0, nextThreeMonths: 0, expiringSoon: [] },
      },
      needsAttention: [],
      metadata: {},
    }
  }

  const stats = {
    total: result.total || result.data.length,
    active: 0,
    maintenance: 0,
    byFunction: {},
    byLogisticType: {},
    byOwnership: {},
    documentExpiry: {
      stnk: { thisMonth: 0, nextThreeMonths: 0, expiringSoon: [] },
      tax: { thisMonth: 0, nextThreeMonths: 0, expiringSoon: [] },
    },
    needsAttention: [],
    metadata: {
      ...result.metadata,
      timestamp: getJakartaDate().toISOString(),
    },
  }

  const now = getJakartaDate()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextThreeMonths = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  result.data.forEach((vehicle) => {
    try {
      if (vehicle.status === 'active') stats.active++
      else if (vehicle.status === 'maintenance') stats.maintenance++

      const vehicleFunction = vehicle.vehicleFunction?.trim() || 'Unknown'
      stats.byFunction[vehicleFunction] = (stats.byFunction[vehicleFunction] || 0) + 1

      const logisticType = vehicle.logisticType?.trim() || 'Unknown'
      stats.byLogisticType[logisticType] = (stats.byLogisticType[logisticType] || 0) + 1

      const ownership = vehicle.ownership?.trim() || 'Unknown'
      stats.byOwnership[ownership] = (stats.byOwnership[ownership] || 0) + 1

      // Check document expiry dates
      if (vehicle.stnkExpiry) {
        const stnkDate = new Date(vehicle.stnkExpiry)
        if (stnkDate >= thisMonth && stnkDate <= nextThreeMonths) {
          stats.documentExpiry.stnk.nextThreeMonths++
          if (stnkDate.getMonth() === now.getMonth()) {
            stats.documentExpiry.stnk.thisMonth++
          }
          stats.documentExpiry.stnk.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.stnkExpiry,
          })
        }
      }

      if (vehicle.taxExpiry) {
        const taxDate = new Date(vehicle.taxExpiry)
        if (taxDate >= thisMonth && taxDate <= nextThreeMonths) {
          stats.documentExpiry.tax.nextThreeMonths++
          if (taxDate.getMonth() === now.getMonth()) {
            stats.documentExpiry.tax.thisMonth++
          }
          stats.documentExpiry.tax.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.taxExpiry,
          })
        }
      }
    } catch (error) {
      console.error('Error processing vehicle:', error)
    }
  })

  // Log only summary statistics
  console.log('Vehicle stats summary:', {
    total: stats.total,
    active: stats.active,
    maintenance: stats.maintenance,
    utilization: `${Math.round((stats.active / stats.total) * 100)}%`,
    logisticTypes: Object.keys(stats.byLogisticType).length,
    ownership: Object.keys(stats.byOwnership).length,
  })

  return stats
}
