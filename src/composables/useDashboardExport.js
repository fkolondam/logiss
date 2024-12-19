import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const useDashboardExport = () => {
  // Convert data to CSV format
  const convertToCSV = (data, headers) => {
    if (!data?.length) return ''

    const headerRow = headers.map(h => h.label).join(',')
    const rows = data.map(item => 
      headers.map(header => {
        let value = header.getter ? header.getter(item) : item[header.key]
        
        // Handle special values
        if (value === null || value === undefined) value = ''
        if (typeof value === 'string') value = `"${value.replace(/"/g, '""')}"`
        if (value instanceof Date) value = format(value, 'dd/MM/yyyy HH:mm', { locale: id })
        
        return value
      }).join(',')
    )

    return [headerRow, ...rows].join('\n')
  }

  // Export data as CSV
  const exportCSV = (data, headers, filename) => {
    const csv = convertToCSV(data, headers)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
  }

  // Export data as Excel
  const exportExcel = async (data, headers, filename) => {
    try {
      const XLSX = await import('xlsx')
      
      // Convert data to worksheet format
      const ws_data = [
        headers.map(h => h.label),
        ...data.map(item =>
          headers.map(header => {
            let value = header.getter ? header.getter(item) : item[header.key]
            if (value instanceof Date) {
              value = format(value, 'dd/MM/yyyy HH:mm', { locale: id })
            }
            return value
          })
        )
      ]

      const ws = XLSX.utils.aoa_to_sheet(ws_data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      
      // Generate Excel file
      XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      // Fallback to CSV if Excel export fails
      exportCSV(data, headers, filename)
    }
  }

  // Export delivery data
  const exportDeliveries = (deliveries, type = 'csv') => {
    const headers = [
      { key: 'date', label: 'Tanggal' },
      { key: 'time', label: 'Waktu' },
      { key: 'invoice', label: 'No. Invoice' },
      { key: 'customer', label: 'Customer' },
      { key: 'location', label: 'Lokasi' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Jumlah' },
      { key: 'driver', label: 'Driver' },
      { key: 'vehicleNumber', label: 'No. Kendaraan' },
      { key: 'branch', label: 'Cabang' }
    ]

    if (type === 'excel') {
      exportExcel(deliveries, headers, 'deliveries')
    } else {
      exportCSV(deliveries, headers, 'deliveries')
    }
  }

  // Export expenses data
  const exportExpenses = (expenses, type = 'csv') => {
    const headers = [
      { key: 'date', label: 'Tanggal' },
      { key: 'category', label: 'Kategori' },
      { key: 'amount', label: 'Jumlah' },
      { key: 'description', label: 'Keterangan' },
      { key: 'vehicleNumber', label: 'No. Kendaraan' },
      { key: 'driver', label: 'Driver' },
      { key: 'status', label: 'Status' },
      { key: 'branch', label: 'Cabang' }
    ]

    if (type === 'excel') {
      exportExcel(expenses, headers, 'expenses')
    } else {
      exportCSV(expenses, headers, 'expenses')
    }
  }

  // Export vehicle status data
  const exportVehicleStatus = (vehicles, type = 'csv') => {
    const headers = [
      { key: 'plateNumber', label: 'No. Kendaraan' },
      { key: 'type', label: 'Tipe' },
      { key: 'status', label: 'Status' },
      { key: 'fuelLevel', label: 'Level BBM' },
      { 
        key: 'assignedDriver',
        label: 'Driver',
        getter: (item) => item.assignedDriver?.name
      },
      { 
        key: 'currentLocation',
        label: 'Lokasi',
        getter: (item) => item.currentLocation?.address
      },
      { key: 'lastServiceDate', label: 'Service Terakhir' },
      { key: 'nextServiceDue', label: 'Service Berikutnya' }
    ]

    if (type === 'excel') {
      exportExcel(vehicles, headers, 'vehicles')
    } else {
      exportCSV(vehicles, headers, 'vehicles')
    }
  }

  return {
    exportDeliveries,
    exportExpenses,
    exportVehicleStatus
  }
}
