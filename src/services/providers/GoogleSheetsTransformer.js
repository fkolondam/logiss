export class GoogleSheetsTransformer {
  constructor() {
    this.branchesCache = new Map()
  }

  // Set branches data in cache
  setBranchesData(branchesData) {
    this.branchesCache.clear()
    branchesData.forEach((branch) => {
      if (branch && branch[1]) {
        // branch[1] is Branch Name
        this.branchesCache.set(branch[1], {
          branchId: branch[0],
          branchName: branch[1], // Store full branch name
          region: branch[2],
          address: branch[3],
          coordinates: {
            lat: Number(branch[4]) || 0,
            lng: Number(branch[5]) || 0,
          },
        })
      }
    })
    console.log('Branches cache updated with:', Array.from(this.branchesCache.keys()))
  }

  // Parse datetime string from Google Sheets
  parseDatetime(datetimeStr) {
    try {
      // Handle empty input
      if (!datetimeStr) return { date: '', time: '' }

      // Split into date and time parts
      const [datePart, timePart] = datetimeStr.split(' ')

      if (datePart) {
        let month, day, year

        // Handle different date formats
        if (datePart.includes('/')) {
          // Format: m/d/yyyy or mm/dd/yyyy
          ;[month, day, year] = datePart.split('/')
        } else if (datePart.includes('-')) {
          // Format: yyyy-mm-dd
          ;[year, month, day] = datePart.split('-')
        } else {
          throw new Error('Unsupported date format: ' + datePart)
        }

        // Ensure year is 4 digits
        if (year.length === 2) {
          year = '20' + year
        }

        // Convert to m/d/yyyy format
        const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`

        // Extract time if available
        let formattedTime = ''
        if (timePart) {
          // Keep original time format (HH:mm:ss)
          formattedTime = timePart
        }

        return {
          date: formattedDate,
          time: formattedTime,
        }
      }

      return { date: '', time: '' }
    } catch (error) {
      console.error('Error parsing datetime:', error, datetimeStr)
      return { date: '', time: '' }
    }
  }

  // Transform delivery data and enrich with branch information
  transformDelivery(row) {
    try {
      // Parse delivery datetime
      const { date, time } = this.parseDatetime(row[5])

      // Log for debugging
      console.log('Processing delivery:', { date, time, row: row[5] })

      const branchName = (row[1] || '').trim() // CABANG
      const branchInfo = this.branchesCache.get(branchName)

      // Parse amount - remove currency symbols and commas
      let amount = 0
      if (row[9]) {
        const cleanAmount = row[9].toString().replace(/[^0-9.-]+/g, '')
        amount = Number(cleanAmount) || 0
      }

      const delivery = {
        id: (row[16] || '').toString().trim(), // Keep ID as string
        timestamp: (row[0] || '').trim(),
        branchName: branchName,
        branchId: branchInfo?.branchId || '',
        branchAddress: branchInfo?.address || '',
        region: branchInfo?.region || '',
        driver: (row[2] || '').trim(), // NAMA DRIVER
        helper: (row[3] || '').trim(), // NAMA HELPER
        vehicleNumber: (row[4] || '').trim(), // NO POLISI ARMADA
        date: date, // WAKTU PENGIRIMAN (date part)
        time: time, // WAKTU PENGIRIMAN (time part)
        customer: (row[6] || '').trim(), // NAMA TOKO
        location: (row[7] || '').trim(), // ALAMAT TOKO
        invoice: (row[8] || '').trim(), // NO FAKTUR
        amount: amount, // NILAI FAKTUR (cleaned)
        paymentMethod: (row[10] || 'TUNAI').trim(), // PEMBAYARAN
        status: (row[11] || '').trim(), // STATUS
        proofImage: (row[12] || '').trim(), // FOTO OUTLET
        coordinates: {
          lat: Number(row[13]) || 0,
          lng: Number(row[14]) || 0,
        },
        branchCoordinates: branchInfo?.coordinates || {
          lat: 0,
          lng: 0,
        },
      }

      return delivery
    } catch (error) {
      console.error('Error transforming delivery row:', error)
      console.log('Problematic row:', row)
      return null
    }
  }

  // Transform branch data
  transformBranch(row) {
    try {
      const branch = {
        branchId: (row[0] || '').trim(),
        branchName: (row[1] || '').trim(), // Store full branch name
        region: (row[2] || '').trim(),
        address: (row[3] || '').trim(),
        coordinates: {
          lat: Number(row[4]) || 0,
          lng: Number(row[5]) || 0,
        },
      }

      // Log successful branch transformation
      console.log('Transformed branch:', branch.branchName)

      return branch
    } catch (error) {
      console.error('Error transforming branch row:', error)
      console.log('Problematic row:', row)
      return null
    }
  }

  // Validate delivery data
  validateDelivery(data) {
    if (!data) return false

    // Required fields
    if (!data.id || !data.branchName) {
      console.log('Failed validation - missing required fields:', {
        id: data.id,
        branchName: data.branchName,
      })
      return false
    }

    // Amount validation
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      console.log('Failed validation - invalid amount:', data.amount)
      return false
    }

    // Log successful validation
    console.log('Delivery validated successfully:', { id: data.id, branchName: data.branchName })
    return true
  }

  // Validate branch data
  validateBranch(data) {
    if (!data) return false

    // Required fields
    if (!data.branchId || !data.branchName || !data.region) {
      console.log('Failed branch validation - missing required fields:', data)
      return false
    }

    // Additional validation for branch name format
    if (data.branchName.length < 2) {
      console.log('Failed branch validation - invalid branch name:', data.branchName)
      return false
    }

    return true
  }

  // Transform expense data
  transformExpense(row) {
    try {
      // Parse amount - remove currency symbols and commas
      let amount = 0
      if (row[5]) {
        const cleanAmount = row[5].toString().replace(/[^0-9.-]+/g, '')
        amount = Number(cleanAmount) || 0
      }

      // Parse date
      const { date } = this.parseDatetime(row[6] || '')

      const expense = {
        // Main display fields
        branch: (row[1] || '').trim(),
        date: date,
        category: (row[10] || '').trim(), // Expenses Category
        component: (row[11] || '').trim(), // Komponen
        vehicleNumber: (row[12] || '').trim(), // Nomor Polisi
        amount: amount,

        // Detail fields
        idjournal: (row[0] || '').trim(),
        no_bukti: (row[2] || '').trim(),
        no_akun: (row[3] || '').trim(),
        akun: (row[4] || '').trim(),
        keterangan: (row[7] || '').trim(),
        remarks: (row[8] || '').trim(),
      }

      return expense
    } catch (error) {
      console.error('Error transforming expense row:', error)
      console.log('Problematic row:', row)
      return null
    }
  }

  // Validate expense data
  validateExpense(data) {
    if (!data) return false

    // Required fields
    if (!data.idjournal || !data.branch) {
      console.log('Failed validation - missing required fields:', {
        idjournal: data.idjournal,
        branch: data.branch,
      })
      return false
    }

    // Amount validation
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      console.log('Failed validation - invalid amount:', data.amount)
      return false
    }

    return true
  }

  // Transform vehicle data
  transformVehicle(row) {
    try {
      // Parse dates
      const { date: stnkExpiry } = this.parseDatetime(row[20] || '')
      const { date: taxExpiry } = this.parseDatetime(row[21] || '')

      const vehicle = {
        // Main identification fields
        branch: (row[0] || '').trim(),
        vehicleNumber: (row[1] || '').trim(),
        logisticType: (row[2] || '').trim(),
        ownerName: (row[3] || '').trim(),
        ownership: (row[4] || '').trim(),
        status: (row[5] || '').trim(),

        // Usage and assignment
        entitledTo: (row[6] || '').trim(),
        user: (row[7] || '').trim(),
        type: (row[8] || '').trim(),
        vehicleFunction: (row[9] || '').trim(),
        operationType: (row[10] || '').trim(),

        // Registration details
        stnkUnitType: (row[11] || '').trim(),
        stnkOwnerName: (row[12] || '').trim(),

        // Vehicle specifications
        brand: (row[13] || '').trim(),
        model: (row[14] || '').trim(),
        color: (row[15] || '').trim(),
        year: (row[16] || '').trim(),
        engineNumber: (row[17] || '').trim(),
        chassisNumber: (row[18] || '').trim(),
        ownershipStatus: (row[19] || '').trim(),

        // Document expiry dates
        stnkExpiry: stnkExpiry,
        taxExpiry: taxExpiry,

        // Photos and documentation
        frontPhoto: (row[22] || '').trim(),
        backPhoto: (row[23] || '').trim(),
        sidePhoto: (row[24] || '').trim(),
        stnkPhoto: (row[25] || '').trim(),
        stnkPhoto38: (row[26] || '').trim(),
        taxPhoto: (row[27] || '').trim(),
        kirLetterPhoto: (row[28] || '').trim(),
        kirCardPhoto: (row[29] || '').trim(),

        // Maintenance and condition
        tireCode: (row[30] || '').trim(),
        equipment: (row[31] || '').trim(),
        bodyBoxCondition: (row[32] || '').trim(),
        bodyConditionPhoto: (row[33] || '').trim(),
        boxConditionPhoto: (row[34] || '').trim(),
        functionality: (row[35] || '').trim(),
        functionalityDocs: (row[36] || '').trim(),

        // Additional information
        additionalInfo: (row[37] || '').trim(),
        vendor: (row[38] || '').trim(),
      }

      return vehicle
    } catch (error) {
      console.error('Error transforming vehicle row:', error)
      console.log('Problematic row:', row)
      return null
    }
  }

  // Validate vehicle data
  validateVehicle(data) {
    if (!data) return false

    // Required fields
    if (!data.vehicleNumber || !data.branch) {
      console.log('Failed validation - missing required fields:', {
        vehicleNumber: data.vehicleNumber,
        branch: data.branch,
      })
      return false
    }

    // Basic data validation
    if (!data.status || !data.type) {
      console.log('Failed validation - missing status or type:', {
        status: data.status,
        type: data.type,
      })
      return false
    }

    return true
  }

  // Transform invoice data
  transformInvoice(row) {
    try {
      // Parse date
      const { date } = this.parseDatetime(row[12] || '')

      // Parse amounts - remove currency symbols and commas
      let dpp = 0
      let ppn = 0
      let netSales = 0

      if (row[17]) {
        const cleanDpp = row[17].toString().replace(/[^0-9.-]+/g, '')
        dpp = Number(cleanDpp) || 0
      }
      if (row[18]) {
        const cleanPpn = row[18].toString().replace(/[^0-9.-]+/g, '')
        ppn = Number(cleanPpn) || 0
      }
      if (row[19]) {
        const cleanNetSales = row[19].toString().replace(/[^0-9.-]+/g, '')
        netSales = Number(cleanNetSales) || 0
      }

      const invoice = {
        // Branch and system info
        branch: (row[3] || '').trim(),
        system: (row[4] || '').trim(),

        // Principal info
        principal: (row[5] || '').trim(),
        principalXxx: (row[6] || '').trim(),

        // Salesman info
        salesmanCode: (row[7] || '').trim(),
        salesmanName: (row[8] || '').trim(),

        // Customer info
        customerCode: (row[9] || '').trim(),
        customerName: (row[10] || '').trim(),
        channel: (row[11] || '').trim(),

        // Transaction info
        date: date,
        invoiceNumber: (row[13] || '').trim(),
        transactionType: (row[14] || '').trim(),
        transactionReason: (row[15] || '').trim(),
        warehouseReason: (row[16] || '').trim(),

        // Financial info
        dpp: dpp,
        ppn: ppn,
        netSales: netSales,
      }

      return invoice
    } catch (error) {
      console.error('Error transforming invoice row:', error)
      console.log('Problematic row:', row)
      return null
    }
  }

  // Validate invoice data
  validateInvoice(data) {
    if (!data) return false

    // Required fields
    if (!data.invoiceNumber || !data.branch) {
      console.log('Failed validation - missing required fields:', {
        invoiceNumber: data.invoiceNumber,
        branch: data.branch,
      })
      return false
    }

    // Amount validation
    if (typeof data.netSales !== 'number' || isNaN(data.netSales)) {
      console.log('Failed validation - invalid net sales amount:', data.netSales)
      return false
    }

    // Basic data validation
    if (!data.customerName || !data.transactionType) {
      console.log('Failed validation - missing customer or transaction type:', {
        customerName: data.customerName,
        transactionType: data.transactionType,
      })
      return false
    }

    return true
  }
}
