export const sheetsConfig = {
  // Base URLs for published CSV sheets
  deliveriesSheetUrl: import.meta.env.VITE_SHEETS_DELIVERIES_URL || '',
  branchesSheetUrl: import.meta.env.VITE_SHEETS_BRANCHES_URL || '',
  expensesSheetUrl: import.meta.env.VITE_SHEETS_EXPENSES_URL || '',

  // Sheet structure definitions
  structure: {
    expenses: {
      // Actual CSV Headers:
      // idjournal,branch,no_bukti,no_akun,akun,amount,tanggal_lengkap,keterangan,
      // remarks tipe3_remap,Expenses Category,Komponen,Nomor Polisi
      columns: [
        'idjournal', // Column A (0)
        'branch', // Column B (1)
        'no_bukti', // Column C (2)
        'no_akun', // Column D (3)
        'akun', // Column E (4)
        'amount', // Column F (5)
        'tanggal_lengkap', // Column G (6)
        'keterangan', // Column H (7)
        'remarks_tipe3_remap', // Column I (8)
        'expenses_category', // Column J (9)
        'komponen', // Column K (10)
        'nomor_polisi', // Column L (11)
      ],
    },
    deliveries: {
      // Actual CSV Headers:
      // Timestamp,CABANG,NAMA DRIVER,NAMA HELPER,NO POLISI ARMADA,WAKTU PENGIRIMAN,
      // NAMA TOKO,ALAMAT TOKO,NO FAKTUR,NILAI FAKTUR,PEMBAYARAN,STATUS,FOTO OUTLET,
      // LATITUDE,LONGITUDE,COORDINATE,ID,INPUTAN,LINK FORM
      columns: [
        'timestamp', // Column A (0)
        'branchName', // Column B (1) - CABANG
        'driver', // Column C (2) - NAMA DRIVER
        'helper', // Column D (3) - NAMA HELPER
        'vehicleNumber', // Column E (4) - NO POLISI ARMADA
        'date', // Column F (5) - WAKTU PENGIRIMAN
        'customer', // Column G (6) - NAMA TOKO
        'location', // Column H (7) - ALAMAT TOKO
        'invoice', // Column I (8) - NO FAKTUR
        'amount', // Column J (9) - NILAI FAKTUR
        'paymentMethod', // Column K (10) - PEMBAYARAN
        'status', // Column L (11) - STATUS
        'proofImage', // Column M (12) - FOTO OUTLET
        'coordinates.lat', // Column N (13) - LATITUDE
        'coordinates.lng', // Column O (14) - LONGITUDE
        'coordinate', // Column P (15) - COORDINATE
        'id', // Column Q (16) - ID
        'input', // Column R (17) - INPUTAN
        'formLink', // Column S (18) - LINK FORM
      ],
    },
    branches: {
      columns: [
        'branchId', // Column A (0)
        'branchName', // Column B (1)
        'region', // Column C (2)
        'address', // Column D (3)
        'coordinates.lat', // Column E (4)
        'coordinates.lng', // Column F (5)
      ],
    },
  },

  // Cache configuration
  cache: {
    timeout: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },
}
