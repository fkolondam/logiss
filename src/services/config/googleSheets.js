export const sheetsConfig = {
  // Base URLs for published CSV sheets
  deliveriesSheetUrl: import.meta.env.VITE_SHEETS_DELIVERIES_URL || '',
  branchesSheetUrl: import.meta.env.VITE_SHEETS_BRANCHES_URL || '',
  expensesSheetUrl: import.meta.env.VITE_SHEETS_EXPENSES_URL || '',
  vehiclesSheetUrl: import.meta.env.VITE_SHEETS_VEHICLES_URL || '',
  invoicesSheetUrl: import.meta.env.VITE_SHEETS_INVOICES_URL || '',

  // Sheet structure definitions
  structure: {
    expenses: {
      columns: [
        'idjournal',
        'branch',
        'no_bukti',
        'no_akun',
        'akun',
        'amount',
        'tanggal_lengkap',
        'keterangan',
        'remarks_tipe3_remap',
        'expenses_category',
        'komponen',
        'nomor_polisi',
      ],
    },
    deliveries: {
      columns: [
        'timestamp',
        'branchName',
        'driver',
        'helper',
        'vehicleNumber',
        'date',
        'customer',
        'location',
        'invoice',
        'amount',
        'paymentMethod',
        'status',
        'proofImage',
        'coordinates.lat',
        'coordinates.lng',
        'coordinate',
        'id',
        'input',
        'formLink',
      ],
    },
    branches: {
      columns: [
        'branchId',
        'branchName',
        'region',
        'address',
        'coordinates.lat',
        'coordinates.lng',
      ],
    },
    vehicles: {
      columns: [
        'branch',
        'vehicleNumber',
        'logisticType',
        'ownerName',
        'ownership',
        'status',
        'entitledTo',
        'user',
        'type',
        'vehicleFunction',
        'operationType',
        'stnkUnitType',
        'stnkOwnerName',
        'brand',
        'model',
        'color',
        'year',
        'engineNumber',
        'chassisNumber',
        'ownershipStatus',
        'stnkExpiry',
        'taxExpiry',
        'frontPhoto',
        'backPhoto',
        'sidePhoto',
        'stnkPhoto',
        'stnkPhoto38',
        'taxPhoto',
        'kirLetterPhoto',
        'kirCardPhoto',
        'tireCode',
        'equipment',
        'bodyBoxCondition',
        'bodyConditionPhoto',
        'boxConditionPhoto',
        'functionality',
        'functionalityDocs',
        'additionalInfo',
        'vendor',
      ],
    },
    invoices: {
      columns: [
        'branch',
        'system',
        'principal',
        'principalXxx',
        'salesmanCode',
        'salesmanName',
        'customerCode',
        'customerName',
        'channel',
        'date',
        'invoiceNumber',
        'transactionType',
        'transactionReason',
        'warehouseReason',
        'dpp',
        'ppn',
        'netSales',
      ],
    },
  },
}
