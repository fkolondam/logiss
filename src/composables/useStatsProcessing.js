/**
 * Process delivery stats from raw data
 * Status comes directly from Google Sheets column 'STATUS'
 */
export function processDeliveryStats(result) {
  // Get unique statuses from the data
  const statuses = [...new Set(result.data.map((d) => d.status))]

  // Create byStatus object dynamically
  const byStatus = {}
  statuses.forEach((status) => {
    byStatus[status] = result.data.filter((d) => d.status === status).length
  })

  return {
    total: result.total,
    byStatus,
    byPaymentMethod: {
      tunai: result.data.filter((d) => d.paymentMethod === 'TUNAI').length,
      kredit: result.data.filter((d) => d.paymentMethod === 'KREDIT').length,
    },
    metadata: result.metadata,
  }
}

/**
 * Process expense stats from raw data
 * Components are taken directly from the 'Komponen' column
 */
export function processExpenseStats(result) {
  // Get unique components from the data
  const components = [...new Set(result.data.map((e) => e.component))]

  // Calculate total amount per component
  const byComponent = {}
  components.forEach((component) => {
    byComponent[component] = result.data
      .filter((e) => e.component === component)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
  })

  return {
    total: result.total,
    totalAmount: result.data.reduce((sum, e) => sum + (e.amount || 0), 0),
    byComponent,
    metadata: result.metadata,
  }
}

/**
 * Process vehicle stats from raw data
 */
export function processVehicleStats(result) {
  // Get unique statuses from the data
  const statuses = [...new Set(result.data.map((v) => v.status))]

  // Create byStatus object dynamically
  const byStatus = {}
  statuses.forEach((status) => {
    byStatus[status] = result.data.filter((v) => v.status === status).length
  })

  return {
    total: result.total,
    byStatus,
    byType: {
      ...groupByField(result.data, 'type'),
    },
    byLogisticType: {
      ...groupByField(result.data, 'logisticType'),
    },
    metadata: result.metadata,
  }
}

// Helper function to group data by a field
function groupByField(data, field) {
  const groups = {}
  const uniqueValues = [...new Set(data.map((item) => item[field]))]

  uniqueValues.forEach((value) => {
    if (value) {
      // Only include non-empty values
      groups[value] = data.filter((item) => item[field] === value).length
    }
  })

  return groups
}
