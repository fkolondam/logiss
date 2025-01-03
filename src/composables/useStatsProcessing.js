/**
 * Process delivery stats from raw data
 * Status comes directly from Google Sheets column 'STATUS'
 */
export function processDeliveryStats(result) {
  if (!result?.data) {
    console.warn('No delivery data available')
    return {
      total: 0,
      receivedAll: 0,
      partial: 0,
      resend: 0,
      cancelled: 0,
      byStatus: {},
      byPaymentMethod: {
        tunai: 0,
        kredit: 0,
      },
      trend: 0,
      completionTrend: 0,
      receivedTrend: 0,
      partialTrend: 0,
      resendTrend: 0,
      cancelledTrend: 0,
    }
  }

  // Map status values from Google Sheets to our display values
  const statusMap = {
    'DITERIMA - SEMUA': 'receivedAll',
    'DITERIMA - SEBAGIAN': 'partial',
    'KIRIM ULANG': 'resend',
    BATAL: 'cancelled',
  }

  // Initialize counters with proper typing
  const stats = {
    total: result.total || result.data.length,
    receivedAll: 0,
    partial: 0,
    resend: 0,
    cancelled: 0,
    byStatus: {},
    byPaymentMethod: {
      tunai: 0,
      kredit: 0,
    },
    trend: 0,
    completionTrend: 0,
    receivedTrend: 0,
    partialTrend: 0,
    resendTrend: 0,
    cancelledTrend: 0,
  }

  // Process each delivery with error handling
  result.data.forEach((delivery) => {
    try {
      // Count by status with validation
      const status = delivery.status?.trim().toUpperCase()
      if (status) {
        const mappedStatus = statusMap[status]
        if (mappedStatus) {
          stats[mappedStatus]++
        }
        // Track raw status counts
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
      }

      // Count by payment method with validation
      const paymentMethod = delivery.paymentMethod?.trim().toUpperCase()
      if (paymentMethod === 'TUNAI') {
        stats.byPaymentMethod.tunai++
      } else if (paymentMethod === 'KREDIT') {
        stats.byPaymentMethod.kredit++
      }
    } catch (error) {
      console.error('Error processing delivery:', error, delivery)
    }
  })

  // Add metadata
  stats.metadata = {
    ...result.metadata,
    timestamp: new Date().toISOString(),
  }

  console.log('Processed delivery stats:', stats)
  return stats
}

/**
 * Process expense stats from raw data
 * Components are taken directly from the 'Komponen' column
 */
export function processExpenseStats(result) {
  if (!result?.data) {
    console.warn('No expense data available')
    return {
      total: 0,
      totalAmount: 0,
      byComponent: {},
      trend: 0,
      metadata: {},
    }
  }

  // Initialize stats with component categories matching Google Sheets
  const stats = {
    total: result.total || result.data.length,
    totalAmount: 0,
    byComponent: {},
    trend: 0,
    metadata: {
      ...result.metadata,
      timestamp: new Date().toISOString(),
    },
  }

  // Process each expense with error handling
  result.data.forEach((expense) => {
    try {
      // Add to total amount
      const amount = expense.amount || 0
      stats.totalAmount += amount

      // Group by component with validation
      const component = expense.component?.trim() || 'Uncategorized'
      if (!stats.byComponent[component]) {
        stats.byComponent[component] = {
          count: 0,
          amount: 0,
          trend: 0,
        }
      }
      stats.byComponent[component].count++
      stats.byComponent[component].amount += amount
    } catch (error) {
      console.error('Error processing expense:', error, expense)
    }
  })

  console.log('Processed expense stats:', stats)
  return stats
}

/**
 * Process vehicle stats from raw data
 */
export function processVehicleStats(result) {
  if (!result?.data) {
    console.warn('No vehicle data available')
    return {
      total: 0,
      byFunction: {},
      byLogisticType: {},
      byOwnership: {},
      documentExpiry: {
        stnk: {
          thisMonth: 0,
          nextThreeMonths: 0,
          expiringSoon: [],
        },
        tax: {
          thisMonth: 0,
          nextThreeMonths: 0,
          expiringSoon: [],
        },
      },
      needsAttention: [],
      metadata: {},
    }
  }

  // Initialize stats
  const stats = {
    total: result.total || result.data.length,
    byFunction: {},
    byLogisticType: {},
    byOwnership: {},
    documentExpiry: {
      stnk: {
        thisMonth: 0,
        nextThreeMonths: 0,
        expiringSoon: [],
      },
      tax: {
        thisMonth: 0,
        nextThreeMonths: 0,
        expiringSoon: [],
      },
    },
    needsAttention: [],
    metadata: {
      ...result.metadata,
      timestamp: new Date().toISOString(),
    },
  }

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 1)

  // Process each vehicle with error handling
  result.data.forEach((vehicle) => {
    try {
      // Count by vehicle function (passenger vs logistic)
      const vehicleFunction = vehicle.vehicleFunction?.trim() || 'Unknown'
      stats.byFunction[vehicleFunction] = (stats.byFunction[vehicleFunction] || 0) + 1

      // Count by logistic type (4 RODA L, etc)
      const logisticType = vehicle.logisticType?.trim() || 'Unknown'
      stats.byLogisticType[logisticType] = (stats.byLogisticType[logisticType] || 0) + 1

      // Count by ownership type
      const ownership = vehicle.ownership?.trim() || 'Unknown'
      stats.byOwnership[ownership] = (stats.byOwnership[ownership] || 0) + 1

      // Check STNK expiry
      if (vehicle.stnkExpiry) {
        const stnkExpiryDate = new Date(vehicle.stnkExpiry)
        if (stnkExpiryDate >= thisMonth && stnkExpiryDate < nextMonth) {
          stats.documentExpiry.stnk.thisMonth++
          stats.documentExpiry.stnk.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.stnkExpiry,
            type: 'STNK',
          })
        } else if (stnkExpiryDate >= nextMonth && stnkExpiryDate < threeMonthsLater) {
          stats.documentExpiry.stnk.nextThreeMonths++
          stats.documentExpiry.stnk.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.stnkExpiry,
            type: 'STNK',
          })
        }
      }

      // Check Tax expiry
      if (vehicle.taxExpiry) {
        const taxExpiryDate = new Date(vehicle.taxExpiry)
        if (taxExpiryDate >= thisMonth && taxExpiryDate < nextMonth) {
          stats.documentExpiry.tax.thisMonth++
          stats.documentExpiry.tax.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.taxExpiry,
            type: 'Tax',
          })
        } else if (taxExpiryDate >= nextMonth && taxExpiryDate < threeMonthsLater) {
          stats.documentExpiry.tax.nextThreeMonths++
          stats.documentExpiry.tax.expiringSoon.push({
            vehicleNumber: vehicle.vehicleNumber,
            expiryDate: vehicle.taxExpiry,
            type: 'Tax',
          })
        }
      }

      // Check additional information for actions needed
      if (vehicle.additionalInfo?.trim()) {
        stats.needsAttention.push({
          vehicleNumber: vehicle.vehicleNumber,
          info: vehicle.additionalInfo.trim(),
        })
      }
    } catch (error) {
      console.error('Error processing vehicle:', error, vehicle)
    }
  })

  // Sort expiring documents by date
  stats.documentExpiry.stnk.expiringSoon.sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
  )
  stats.documentExpiry.tax.expiringSoon.sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
  )

  console.log('Processed vehicle stats:', stats)
  return stats
}