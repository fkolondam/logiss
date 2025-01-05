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
  }

  // Parse datetime string from Google Sheets
  parseDatetime(datetimeStr) {
    try {
      if (!datetimeStr) return { date: '', time: '' }

      const [datePart, timePart] = datetimeStr.split(' ')
      if (!datePart) return { date: '', time: '' }

      let month, day, year
      if (datePart.includes('/')) {
        ;[month, day, year] = datePart.split('/')
      } else if (datePart.includes('-')) {
        ;[year, month, day] = datePart.split('-')
      } else {
        return { date: '', time: '' }
      }

      year = year.length === 2 ? '20' + year : year
      const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`
      const formattedTime = timePart || ''

      return { date: formattedDate, time: formattedTime }
    } catch {
      return { date: '', time: '' }
    }
  }

  // Transform delivery data and enrich with branch information
  transformDelivery(row) {
    if (!row || row.length < 17) return null

    try {
      const { date, time } = this.parseDatetime(row[5])
      const branchName = (row[1] || '').trim()
      const branchInfo = this.branchesCache.get(branchName)
      const amount = row[9] ? Number(row[9].toString().replace(/[^0-9.-]+/g, '')) || 0 : 0

      return {
        id: (row[16] || '').toString().trim(),
        timestamp: (row[0] || '').trim(),
        branchName,
        branchId: branchInfo?.branchId || '',
        branchAddress: branchInfo?.address || '',
        region: branchInfo?.region || '',
        driver: (row[2] || '').trim(),
        helper: (row[3] || '').trim(),
        vehicleNumber: (row[4] || '').trim(),
        date,
        time,
        customer: (row[6] || '').trim(),
        location: (row[7] || '').trim(),
        invoice: (row[8] || '').trim(),
        amount,
        paymentMethod: (row[10] || 'TUNAI').trim(),
        status: (row[11] || '').trim(),
        proofImage: (row[12] || '').trim(),
        coordinates: {
          lat: Number(row[13]) || 0,
          lng: Number(row[14]) || 0,
        },
        branchCoordinates: branchInfo?.coordinates || {
          lat: 0,
          lng: 0,
        },
      }
    } catch {
      return null
    }
  }

  // Transform branch data
  transformBranch(row) {
    if (!row || row.length < 6) return null

    return {
      branchId: (row[0] || '').trim(),
      branchName: (row[1] || '').trim(),
      region: (row[2] || '').trim(),
      address: (row[3] || '').trim(),
      coordinates: {
        lat: Number(row[4]) || 0,
        lng: Number(row[5]) || 0,
      },
    }
  }

  // Validate delivery data
  validateDelivery(data) {
    if (!data) return false

    // Required fields
    if (!data.id || !data.branchName) {
      return false
    }

    // Amount validation
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      return false
    }

    return true
  }

  // Validate branch data
  validateBranch(data) {
    if (!data) return false
    if (!data.branchId || !data.branchName || !data.region) return false
    if (data.branchName.length < 2) return false
    return true
  }

  // Transform expense data
  transformExpense(row) {
    if (!row || row.length < 12) return null

    try {
      const amount = row[5] ? Number(row[5].toString().replace(/[^0-9.-]+/g, '')) || 0 : 0
      const { date } = this.parseDatetime(row[6] || '')

      return {
        branch: (row[1] || '').trim(),
        date,
        category: (row[10] || '').trim(),
        component: (row[11] || '').trim(),
        vehicleNumber: (row[12] || '').trim(),
        amount,
        idjournal: (row[0] || '').trim(),
        no_bukti: (row[2] || '').trim(),
        no_akun: (row[3] || '').trim(),
        akun: (row[4] || '').trim(),
        keterangan: (row[7] || '').trim(),
        remarks: (row[8] || '').trim(),
      }
    } catch {
      return null
    }
  }

  // Validate expense data
  validateExpense(data) {
    if (!data) return false
    if (!data.idjournal || !data.branch) return false
    if (typeof data.amount !== 'number' || isNaN(data.amount)) return false
    return true
  }

  // Transform vehicle data
  transformVehicle(row) {
    if (!row || row.length < 39) return null

    try {
      const { date: stnkExpiry } = this.parseDatetime(row[20] || '')
      const { date: taxExpiry } = this.parseDatetime(row[21] || '')

      return {
        branch: (row[0] || '').trim(),
        vehicleNumber: (row[1] || '').trim(),
        logisticType: (row[2] || '').trim(),
        ownerName: (row[3] || '').trim(),
        ownership: (row[4] || '').trim(),
        status: (row[5] || '').trim(),
        entitledTo: (row[6] || '').trim(),
        user: (row[7] || '').trim(),
        type: (row[8] || '').trim(),
        vehicleFunction: (row[9] || '').trim(),
        operationType: (row[10] || '').trim(),
        stnkUnitType: (row[11] || '').trim(),
        stnkOwnerName: (row[12] || '').trim(),
        brand: (row[13] || '').trim(),
        model: (row[14] || '').trim(),
        color: (row[15] || '').trim(),
        year: (row[16] || '').trim(),
        engineNumber: (row[17] || '').trim(),
        chassisNumber: (row[18] || '').trim(),
        ownershipStatus: (row[19] || '').trim(),
        stnkExpiry,
        taxExpiry,
        frontPhoto: (row[22] || '').trim(),
        backPhoto: (row[23] || '').trim(),
        sidePhoto: (row[24] || '').trim(),
        stnkPhoto: (row[25] || '').trim(),
        stnkPhoto38: (row[26] || '').trim(),
        taxPhoto: (row[27] || '').trim(),
        kirLetterPhoto: (row[28] || '').trim(),
        kirCardPhoto: (row[29] || '').trim(),
        tireCode: (row[30] || '').trim(),
        equipment: (row[31] || '').trim(),
        bodyBoxCondition: (row[32] || '').trim(),
        bodyConditionPhoto: (row[33] || '').trim(),
        boxConditionPhoto: (row[34] || '').trim(),
        functionality: (row[35] || '').trim(),
        functionalityDocs: (row[36] || '').trim(),
        additionalInfo: (row[37] || '').trim(),
        vendor: (row[38] || '').trim(),
      }
    } catch {
      return null
    }
  }

  // Validate vehicle data
  validateVehicle(data) {
    if (!data) return false
    if (!data.vehicleNumber || !data.branch) return false
    if (!data.status || !data.type) return false
    return true
  }

  // Transform invoice data
  transformInvoice(row) {
    if (!row || row.length < 17) return null

    try {
      const { date } = this.parseDatetime(row[12] || '')
      const dpp = row[17] ? Number(row[17].toString().replace(/[^0-9.-]+/g, '')) || 0 : 0
      const ppn = row[18] ? Number(row[18].toString().replace(/[^0-9.-]+/g, '')) || 0 : 0
      const netSales = row[19] ? Number(row[19].toString().replace(/[^0-9.-]+/g, '')) || 0 : 0

      return {
        branch: (row[3] || '').trim(),
        system: (row[4] || '').trim(),
        principal: (row[5] || '').trim(),
        principalXxx: (row[6] || '').trim(),
        salesmanCode: (row[7] || '').trim(),
        salesmanName: (row[8] || '').trim(),
        customerCode: (row[9] || '').trim(),
        customerName: (row[10] || '').trim(),
        channel: (row[11] || '').trim(),
        date,
        invoiceNumber: (row[13] || '').trim(),
        transactionType: (row[14] || '').trim(),
        transactionReason: (row[15] || '').trim(),
        warehouseReason: (row[16] || '').trim(),
        dpp,
        ppn,
        netSales,
      }
    } catch {
      return null
    }
  }

  // Validate invoice data
  validateInvoice(data) {
    if (!data) return false
    if (!data.invoiceNumber || !data.branch) return false
    if (typeof data.netSales !== 'number' || isNaN(data.netSales)) return false
    if (!data.customerName || !data.transactionType) return false
    return true
  }
}
