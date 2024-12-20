import { ref } from 'vue'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useDashboardState } from './useDashboardState'

export function useDashboardExport() {
  const provider = dataProviderFactory.getProvider()
  const { withLoadingState } = useDashboardState()
  const lastExport = ref(null)

  // Helper to format data for Excel
  const formatForExcel = (data, type) => {
    switch (type) {
      case 'deliveries':
        return data.map(d => ({
          'ID': d.id,
          'Date': new Date(d.date).toLocaleDateString(),
          'Status': d.status,
          'Origin': d.origin,
          'Destination': d.destination,
          'Vehicle ID': d.vehicleId,
          'Driver': d.driver,
          'Distance (km)': d.distance,
          'Duration (hrs)': d.duration,
          'Cost': d.cost
        }))
      case 'expenses':
        return data.map(e => ({
          'ID': e.id,
          'Date': new Date(e.date).toLocaleDateString(),
          'Category': e.category,
          'Description': e.description,
          'Amount': e.amount,
          'Vehicle ID': e.vehicleId,
          'Notes': e.notes
        }))
      case 'vehicles':
        return data.map(v => ({
          'ID': v.id,
          'Type': v.type,
          'Status': v.status,
          'License Plate': v.licensePlate,
          'Brand': v.brand,
          'Model': v.model,
          'Year': v.year,
          'Last Maintenance': new Date(v.lastMaintenance).toLocaleDateString(),
          'Next Maintenance': new Date(v.nextMaintenance).toLocaleDateString(),
          'Fuel Level': v.fuelLevel,
          'Mileage': v.mileage
        }))
      default:
        return data
    }
  }

  // Helper to convert to CSV
  const convertToCSV = (data) => {
    if (!data || !data.length) return ''
    
    const headers = Object.keys(data[0])
    const rows = data.map(obj => 
      headers.map(header => {
        const value = obj[header]
        // Handle values that need quotes (contains comma or newline)
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }

  // Export deliveries
  const exportDeliveries = async (data = [], format = 'excel') => {
    return await withLoadingState('export', async () => {
      const result = await provider.exportDeliveries(data, format)
      const formattedData = formatForExcel(result.data, 'deliveries')
      
      lastExport.value = {
        type: 'deliveries',
        format,
        timestamp: result.timestamp,
        data: formattedData
      }

      if (format === 'csv') {
        return convertToCSV(formattedData)
      }
      
      return formattedData
    })
  }

  // Export expenses
  const exportExpenses = async (data = [], format = 'excel') => {
    return await withLoadingState('export', async () => {
      const result = await provider.exportExpenses(data, format)
      const formattedData = formatForExcel(result.data, 'expenses')
      
      lastExport.value = {
        type: 'expenses',
        format,
        timestamp: result.timestamp,
        data: formattedData
      }

      if (format === 'csv') {
        return convertToCSV(formattedData)
      }
      
      return formattedData
    })
  }

  // Export vehicle status
  const exportVehicleStatus = async (data = [], format = 'excel') => {
    return await withLoadingState('export', async () => {
      const result = await provider.exportVehicleStatus(data, format)
      const formattedData = formatForExcel(result.data, 'vehicles')
      
      lastExport.value = {
        type: 'vehicles',
        format,
        timestamp: result.timestamp,
        data: formattedData
      }

      if (format === 'csv') {
        return convertToCSV(formattedData)
      }
      
      return formattedData
    })
  }

  // Download helper
  const downloadFile = (data, filename, format = 'excel') => {
    let content, type, extension
    
    if (format === 'csv') {
      content = data
      type = 'text/csv'
      extension = 'csv'
    } else {
      content = JSON.stringify(data, null, 2)
      type = 'application/json'
      extension = 'json'
    }
    
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${filename}_${new Date().toISOString()}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    exportDeliveries,
    exportExpenses,
    exportVehicleStatus,
    downloadFile,
    lastExport
  }
}
