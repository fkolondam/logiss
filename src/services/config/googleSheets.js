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
    vehicles: {
      columns: [
        'branch', // Column A (0) - BRANCH
        'vehicleNumber', // Column B (1) - NOPOL
        'logisticType', // Column C (2) - TIPE LOGISTIK
        'ownerName', // Column D (3) - NAMA PEMILIK/VENDOR
        'ownership', // Column E (4) - OWNERSHIP
        'status', // Column F (5) - STATUS
        'entitledTo', // Column G (6) - ENTITLED TO
        'user', // Column H (7) - USER
        'type', // Column I (8) - TYPE
        'vehicleFunction', // Column J (9) - FUNGSI KENDARAAN
        'operationType', // Column K (10) - TIPE OPERASIONAL
        'stnkUnitType', // Column L (11) - TIPE UNIT STNK
        'stnkOwnerName', // Column M (12) - NAMA PEMILIK STNK
        'brand', // Column N (13) - MERK / BRAND
        'model', // Column O (14) - TIPE
        'color', // Column P (15) - WARNA
        'year', // Column Q (16) - TAHUN PEMBUATAN
        'engineNumber', // Column R (17) - NOMOR MESIN
        'chassisNumber', // Column S (18) - NOMOR RANGKA
        'ownershipStatus', // Column T (19) - STATUS KEPEMILIKAN
        'stnkExpiry', // Column U (20) - MASA BERLAKU STNK
        'taxExpiry', // Column V (21) - MASA BERLAKU PAJAK TAHUNAN
        'frontPhoto', // Column W (22) - FOTO TAMPAK DEPAN
        'backPhoto', // Column X (23) - FOTO TAMPAK BELAKANG
        'sidePhoto', // Column Y (24) - FOTO TAMPAK SAMPING
        'stnkPhoto', // Column Z (25) - FOTO STNK
        'stnkPhoto38', // Column AA (26) - FOTO STNK_38
        'taxPhoto', // Column AB (27) - FOTO PAJAK
        'kirLetterPhoto', // Column AC (28) - FOTO SURAT KIR
        'kirCardPhoto', // Column AD (29) - FOTO KARTU KIR
        'tireCode', // Column AE (30) - KODE BAN
        'equipment', // Column AF (31) - KELENGKAPAN ALAT
        'bodyBoxCondition', // Column AG (32) - KONDISI FISIK BODY DAN BOX
        'bodyConditionPhoto', // Column AH (33) - FOTO KONDISI BODY
        'boxConditionPhoto', // Column AI (34) - FOTO KONDISI BOX
        'functionality', // Column AJ (35) - FUNGSIONALITAS
        'functionalityDocs', // Column AK (36) - DOKUMENTASI FUNGSIONALITAS
        'additionalInfo', // Column AL (37) - INFORMASI TAMBAHAN
        'vendor', // Column AM (38) - VENDOR
      ],
    },
    invoices: {
      columns: [
        'branch', // Column A (3) - CABANG
        'system', // Column B (4) - SISTEM
        'principal', // Column C (5) - PRINCIPAL
        'principalXxx', // Column D (6) - PRINCIPAL xxx
        'salesmanCode', // Column E (7) - KODESALESMAN
        'salesmanName', // Column F (8) - NAMASALESMAN
        'customerCode', // Column G (9) - KODECUSTOMER
        'customerName', // Column H (10) - NAMACUSTOMER
        'channel', // Column I (11) - CHANNEL
        'date', // Column J (12) - TANGGAL LENGKAP
        'invoiceNumber', // Column K (13) - NOMORNOTA
        'transactionType', // Column L (14) - TIPETRANS
        'transactionReason', // Column M (15) - TIPETRANS REASON
        'warehouseReason', // Column N (16) - TIPE REASON GUDANG
        'dpp', // Column O (17) - DPP
        'ppn', // Column P (18) - PPN
        'netSales', // Column Q (19) - NET SALES
      ],
    },
  },

  // Cache configuration
  cache: {
    timeout: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },
}
