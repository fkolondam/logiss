export default {
  app: {
    title: 'Logistik Dashboard',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
  },
  common: {
    viewAll: 'Lihat Semua',
    details: 'Detail',
    viewDetails: 'Lihat Detail',
    close: 'Tutup',
    openInNewTab: 'Buka di Tab Baru',
    share: 'Bagikan',
    done: 'Selesai',
    'toggle-sidebar': 'Buka/Tutup Sidebar',
    periods: {
      today: 'Hari ini',
      this_week: 'Minggu ini',
      this_month: 'Bulan ini',
      custom: 'Custom',
      lastThreeMonths: 'L3M',
      monthToDate: 'MTD',
    },
  },
  menu: {
    home: 'Beranda',
    deliveries: 'Pengiriman',
    expenses: 'Pengeluaran',
    vehicles: 'Kendaraan',
    profile: 'Profil',
    logout: 'Keluar',
    debug: 'Debug Tools',
    selectUser: 'Pilih Pengguna',
  },
  dataSelector: {
    title: 'Pemilih Data',
    source: 'Sumber Data',
    scope: 'Cakupan',
    filterBy: 'Filter berdasarkan',
    filters: {
      recent: 'Terbaru',
      favorites: 'Favorit',
    },
    loading: 'Memuat sumber data...',
    error: 'Gagal memuat sumber data',
    select: 'Pilih sumber data',
    noData: 'Tidak ada data tersedia',
    noResults: 'Tidak ada hasil',
    description: 'Pilih sumber data dan cakupan',
    resetScope: 'Reset cakupan',
    selectScope: 'Pilih cakupan',
    searchPlaceholder: 'Cari...',
  },
  scope: {
    global: 'Akses Global',
    region: 'Region',
    branch: 'Cabang',
    personal: 'Personal',
    regions: 'Region',
    branches: 'Cabang',
    select: 'Pilih Cakupan',
    all: 'Semua',
    allData: 'Semua Data',
    level: {
      global: 'Akses Global',
      region: 'Akses Region',
      branch: 'Akses Cabang',
      personal: 'Akses Personal',
    },
  },
  dashboard: {
    title: 'Dashboard',
    refresh: 'Segarkan Data',
    noAccess: 'Anda tidak memiliki akses ke data dashboard',
    overview: 'Ringkasan',
    details: 'Detail',
    recentDeliveries: 'Pengiriman Terkini',
    noDeliveries: 'Tidak ada pengiriman.',
    deliveryStats: {
      total: 'Total Pengiriman',
      completed: 'Selesai',
      pending: 'Dalam Proses',
      cancelled: 'Dibatalkan',
      deliveryStatus: 'Status Pengiriman',
      todayDeliveries: 'Pengiriman Hari Ini',
    },
  },
  deliveries: {
    title: 'Pengiriman',
    personal: {
      title: 'Pengiriman Saya',
    },
    today: 'Hari Ini',
    deliveryStatus: 'Status Pengiriman',
    details: 'Detail Pengiriman',
    loading: 'Memuat pengiriman...',
    search: 'Cari pengiriman...',
    filter: 'Filter',
    searchPlaceholder: 'Cari pelanggan atau lokasi',
    allStatus: 'Semua Status',
    allPayments: 'Semua Pembayaran',
    resetFilters: 'Reset Filter',
    viewDetails: 'Lihat Detail',
    noDeliveries: 'Tidak Ada Pengiriman',
    noDeliveriesDesc: 'Tidak ada pengiriman yang dapat ditampilkan saat ini.',
    tooltips: {
      search: 'Cari pengiriman berdasarkan faktur, pelanggan, atau lokasi',
      filter: 'Filter pengiriman berdasarkan status atau tanggal',
      status: {
        delivered: 'Pengiriman selesai',
        partial: 'Pengiriman sebagian',
        cancelled: 'Pengiriman dibatalkan',
      },
    },
    noProofAvailable: 'Tidak ada bukti pengiriman',
    paymentMethod: {
      cash: 'Tunai',
      credit: 'Kredit',
    },
    table: {
      invoice: 'Faktur',
      date: 'Tanggal',
      time: 'Waktu',
      customer: 'Pelanggan',
      location: 'Lokasi',
      amount: 'Jumlah',
      status: 'Status',
      driver: 'Pengemudi',
      licensePlate: 'Plat Nomor',
      shipment: 'Pengiriman',
      paymentMethod: 'Metode Pembayaran',
      details: 'Detail',
      actions: 'Aksi',
    },
    pagination: {
      showing: 'Menampilkan',
      to: 'hingga',
      of: 'dari',
      items: 'data',
      loadMore: 'Muat Lebih Banyak',
      page: 'Halaman',
      perPage: 'Per Halaman',
    },
    status: {
      completed: 'Selesai',
      in_transit: 'Dalam Perjalanan',
      pending: 'Menunggu',
      cancelled: 'Dibatalkan',
      'diterima - semua': 'Diterima - Semua',
      'diterima - sebagian': 'Diterima - Sebagian',
      batal: 'Batal',
      'batal - toko tutup': 'Batal - Toko Tutup',
      'batal - toko tidak dapat diakses': 'Batal - Toko Tidak Dapat Diakses',
      'batal - tidak ada uang': 'Batal - Tidak Ada Uang',
      'batal - salah order': 'Batal - Salah Order',
      'minta kirim ulang': 'Minta Kirim Ulang',
    },
    tabs: {
      delivery: 'Pengiriman',
      customer: 'Pelanggan',
      proof: 'Bukti',
    },
    stats: {
      todayDeliveries: 'Pengiriman Hari Ini',
      completionRate: 'Tingkat Penyelesaian',
      thisWeek: 'Minggu Ini',
      fromLastWeek: 'dari minggu lalu',
      thisMonth: 'Bulan Ini',
      monthlyTarget: 'Target Bulanan',
    },
    periods: {
      today: 'Hari ini',
      yesterday: 'Hari sebelumnya',
      this_week: 'Minggu ini',
      last_week: 'Minggu lalu',
      this_month: 'Bulan ini',
      last_month: 'Bulan lalu',
      custom: 'Kustom',
    },
  },
  expenses: {
    title: 'Pengeluaran',
    total: 'Total Pengeluaran',
    breakdown: 'Rincian Pengeluaran',
    increased: 'Meningkat',
    decreased: 'Menurun',
    noExpenses: 'Tidak ada pengeluaran',
    periods: {
      today: 'Hari Ini',
      this_week: 'Minggu Ini',
      this_month: 'Bulan Ini',
      custom: 'Custom',
      week: 'Mingguan',
      month: 'Bulanan',
      thisWeek: 'Minggu Ini',
      thisMonth: 'Bulan Ini',
      lastThreeMonths: '3 Bulan Terakhir',
      monthToDate: 'Bulan Berjalan',
      yesterday: 'Kemarin',
      last_week: 'Minggu Lalu',
      last_month: 'Bulan Lalu',
    },
    categories: {
      fuel: 'Bahan Bakar',
      maintenance: 'Pemeliharaan',
      vehicleLicense: 'Surat Kendaraan',
      labour: 'Kuli Bongkar',
      toll: 'Tol',
      parking: 'Parkir',
      retribution: 'Retribusi',
      insurance: 'Asuransi',
      others: 'Lainnya',
    },
    stats: {
      total: 'Total',
      approved: 'Disetujui',
      pending: 'Menunggu',
      thisWeek: 'Minggu Ini',
      thisMonth: 'Bulan Ini',
    },
    periods: {
      today: 'Hari ini',
      yesterday: 'Hari sebelumnya',
      this_week: 'Minggu ini',
      last_week: 'Minggu lalu',
      this_month: 'Bulan ini',
      last_month: 'Bulan lalu',
      custom: 'Kustom',
    },
  },
  vehicles: {
    title: 'Kendaraan',
    noVehicles: 'Tidak ada kendaraan.',
    function: {
      title: 'Fungsi Kendaraan',
      passenger: 'Kendaraan Penumpang',
      logistic: 'Kendaraan Logistik',
    },
    status: {
      active: 'Aktif',
      maintenance: 'Dalam Perawatan',
      inactive: 'Tidak Aktif',
    },
    fuel: 'Level BBM',
    logisticType: {
      title: 'Tipe Logistik',
      '4 RODA L': 'Logistik 4 Roda',
      '6 RODA L': 'Logistik 6 Roda',
      'MOTOR L': 'Logistik Motor',
    },
    ownership: {
      title: 'Tipe Kepemilikan',
      SEWA: 'Sewa',
      MILIK: 'Milik Sendiri',
    },
    documents: {
      title: 'Dokumen & Servis',
      expiry: 'Status Kadaluarsa Dokumen',
      expiring: 'Akan Kadaluarsa',
      thisMonth: 'bulan ini',
      nextThreeMonths: 'dalam 3 bulan kedepan',
      tax: 'Pajak Tahunan',
      warning: 'Beberapa kendaraan memerlukan perhatian segera',
    },
    attention: {
      title: 'Kendaraan yang Perlu Perhatian',
    },
    stats: {
      total: 'Total Kendaraan',
      byFunction: 'Berdasarkan Fungsi',
      byType: 'Berdasarkan Tipe',
      byOwnership: 'Berdasarkan Kepemilikan',
    },
    periods: {
      today: 'Hari ini',
      yesterday: 'Kemarin',
      this_week: 'Minggu ini',
      last_week: 'Minggu lalu',
      this_month: 'Bulan ini',
      last_month: 'Bulan lalu',
    },
  },
  debug: {
    title: 'Debug Tools',
    dataSourceControl: 'Kontrol Sumber Data',
    deliveriesTest: 'Test Data Pengiriman',
    expensesTest: 'Test Data Pengeluaran',
    vehiclesTest: 'Test Data Kendaraan',
    recordsFound: 'Ditemukan {count} data',
    loading: 'Memuat...',
    error: 'Error: {message}',
  },
  dataSources: {
    mock: 'Data Simulasi',
    mysql: 'MySQL',
    google_sheets: 'Google Sheets',
  },
  settings: {
    title: 'Pengaturan',
    language: 'Bahasa',
    notifications: 'Notifikasi',
    profile: 'Profil',
  },
  language: {
    select: 'Pilih Bahasa',
    en: 'English',
    id: 'Bahasa Indonesia',
  },
  notifications: {
    title: 'Notifikasi',
    empty: 'Tidak ada notifikasi',
  },
  roles: {
    admin: 'Administrator',
    manager: 'Manajer',
    user: 'Pengguna',
    operational: 'Operator Lapangan',
    staff: 'SPV Logistic Cabang',
    branch_manager: 'Branch Manager',
    regional_manager: 'Regional Operational Manager',
  },
  errors: {
    fetchDeliveries: 'Gagal mengambil data pengiriman',
    fetchExpenses: 'Gagal mengambil data pengeluaran',
    fetchVehicles: 'Gagal mengambil data kendaraan',
    fetchDashboard: 'Gagal mengambil data dashboard',
    invalidDateRange: 'Rentang tanggal tidak valid',
    fetchFailed: 'Gagal mengambil data',
    allSectionsFailed: 'Semua bagian gagal dimuat',
    someSectionsFailed: 'Beberapa bagian gagal dimuat',
    unexpectedError: 'Terjadi kesalahan tidak terduga',
    refreshError: 'Gagal menyegarkan data',
    initError: 'Gagal menginisialisasi',
    code: 'Kode kesalahan',
  },

  userSelector: {
    searchPlaceholder: 'Cari pengguna...',
    accessLevel: 'Level Akses',
    permissions: 'Izin',
    permissionsCount: '{count} izin',
    selectUser: 'Pilih Pengguna',
  },
  permissions: {
    read_branch_data: 'Baca Data Cabang',
    write_branch_expenses: 'Tulis Biaya Cabang',
    approve_branch_expenses: 'Setujui Biaya Cabang',
    view_branch_dashboard: 'Lihat Dasbor Cabang',
    view_branch_deliveries: 'Lihat Pengiriman Cabang',
    view_branch_vehicles: 'Lihat Kendaraan Cabang',
    read_region_data: 'Baca Data Region',
    write_region_data: 'Tulis Data Region',
    write_branch_data: 'Tulis Data Cabang',
    approve_region_expenses: 'Setujui Biaya Region',
    view_region_dashboard: 'Lihat Dasbor Region',
    manage_region_vehicles: 'Atur Kendaraan Region',
    manage_branch_vehicles: 'Atur Kendaraan Cabang',
    view_branch_expenses: 'Lihat Biaya Cabang',
    read_personal_data: 'Baca Data Pribadi',
    write_delivery: 'Input Pengiriman',
    write_expenses: 'Input Pengeluaran',
    view_personal_dashboard: 'Lihat Dasbor Pribadi',
    view_assigned_vehicle: 'Lihat Kendaraan yang Dipakai',
    all: 'Semua Ijin',
  },
  profile: {
    title: 'Profile', // 'Profil'
    comingSoon: 'Segera Hadir',
  },
}
