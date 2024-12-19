export default {
  app: {
    title: 'Manajemen Armada',
    loading: 'Memuat...',
    error: 'Error'
  },
  common: {
    close: 'Tutup',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    success: 'Berhasil',
    viewDetails: 'Lihat Detail',
    back: 'Kembali',
    openInNewTab: 'Buka di tab baru',
    share: 'Bagikan',
    viewAll: 'Lihat Semua',
    details: 'Detail',
    refresh: 'Segarkan',
    of: 'dari',
    viewAllVehicles: 'Lihat Semua Kendaraan',
    filters: 'Filter',
    search: 'Cari',
    justNow: 'Baru saja',
    minutesAgo: '{minutes} menit yang lalu',
    hoursAgo: '{hours} jam yang lalu',
    daysAgo: '{days} hari yang lalu'
  },
  menu: {
    home: 'Beranda',
    deliveries: 'Pengiriman',
    expenses: 'Pengeluaran',
    vehicles: 'Kendaraan',
    profile: 'Profil',
    logout: 'Keluar',
    debug: 'Debug Tools'
  },
  dashboard: {
    title: 'Dashboard',
    recentDeliveries: 'Pengiriman Terkini',
    noDeliveries: 'Tidak ada pengiriman.',
    refresh: 'Segarkan Data',
    deliveryStats: {
      total: 'Total Pengiriman',
      succesRate: 'Tingkat Keberhasilan',
      completed: 'Selesai',
      pending: 'Dalam Proses',
      cancelled: 'Dibatalkan',
      deliveryStatus: 'Status Pengiriman',
      todayDeliveries: 'Pengiriman Hari Ini'
    }
  },
  notifications: {
    title: 'Notifikasi',
    empty: 'Tidak ada notifikasi',
    markAllRead: 'Tandai Semua Sudah Dibaca',
    new: 'Baru'
  },
  quickActions: {
    title: 'Aksi Cepat',
    newDelivery: 'Pengiriman Baru',
    viewReports: 'Lihat Laporan',
    checkVehicles: 'Cek Kendaraan'
  },
  export: {
    title: 'Export Data',
    deliveries: 'Export Pengiriman',
    expenses: 'Export Pengeluaran',
    vehicles: 'Export Kendaraan'
  },
  errors: {
    fetchDashboard: 'Gagal memuat data dashboard',
    fetchDeliveries: 'Gagal memuat data pengiriman',
    fetchExpenses: 'Gagal memuat data pengeluaran',
    fetchVehicles: 'Gagal memuat data kendaraan',
    unauthorized: 'Sesi anda telah berakhir',
    forbidden: 'Anda tidak memiliki akses',
    notFound: 'Data tidak ditemukan',
    serverError: 'Terjadi kesalahan pada server',
    network: 'Gagal terhubung ke server',
    unknown: 'Terjadi kesalahan'
  },
  deliveries: {
    title: 'Pengiriman',
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
        cancelled: 'Pengiriman dibatalkan'
      }
    },
    noProofAvailable: 'Tidak ada bukti pengiriman',
    paymentMethod: {
      cash: 'Tunai',
      kredit: 'Kredit'
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
      actions: 'Aksi'
    },
    pagination: {
      showing: 'Menampilkan',
      to: 'hingga',
      of: 'dari',
      items: 'data',
      loadMore: 'Muat Lebih Banyak',
      page: 'Halaman',
      perPage: 'Per Halaman'
    },
    status: {
      'diterima - semua': 'Diterima - Semua',
      'diterima - sebagian': 'Diterima - Sebagian',
      'batal': 'Batal',
      'batal - toko tutup': 'Batal - Toko Tutup',
      'batal - toko tidak dapat diakses': 'Batal - Toko Tidak Dapat Diakses',
      'batal - tidak ada uang': 'Batal - Tidak Ada Uang',
      'batal - salah order': 'Batal - Salah Order',
      'kirim ulang': 'Kirim Ulang'
    },
    tabs: {
      delivery: 'Pengiriman',
      customer: 'Pelanggan',
      proof: 'Bukti'
    },
    stats: {
      todayDeliveries: 'Pengiriman Hari Ini',
      completionRate: 'Tingkat Penyelesaian',
      thisWeek: 'Minggu Ini',
      fromLastWeek: 'dari minggu lalu',
      thisMonth: 'Bulan Ini',
      monthlyTarget: 'Target Bulanan'
    }
  },
  expenses: {
    title: 'Pengeluaran',
    total: 'Total',
    periods: {
      month: 'Bulanan',
      week: 'Mingguan',
      today: 'Hari Ini',
      thisMonth: 'Bulan Ini',
      thisWeek: 'Minggu Ini'
    },
    breakdown: 'Rincian Pengeluaran',
    categories: {
      fuel: 'Bahan Bakar',
      maintenance: 'Pemeliharaan',
      insurance: 'Asuransi',
      others: 'Lainnya'
    },
    stats: {
      total: 'Total Pengeluaran',
      approved: 'Disetujui',
      pending: 'Menunggu'
    }
  },
  vehicles: {
    title: 'Kendaraan',
    noVehicles: 'Tidak ada kendaraan.',
    lowFuel: 'Bahan Bakar Rendah',
    driver: 'Pengemudi',
    location: 'Lokasi',
    fuel: 'Level Bahan Bakar',
    types: {
      deliveryTruck: 'Truk Pengiriman',
      van: 'Van',
      pickup: 'Pickup'
    },
    status: {
      active: 'Aktif',
      maintenance: 'Pemeliharaan',
      inactive: 'Tidak Aktif'
    },
    stats: {
      total: 'Total Kendaraan',
      totalVehicles: 'Total Armada',
      active: 'Kendaraan Aktif',
      activeVehicles: 'Sedang Beroperasi',
      maintenance: 'Dalam Pemeliharaan',
      maintenanceVehicles: 'Sedang Servis',
      lowFuel: 'Bahan Bakar Rendah',
      lowFuelVehicles: 'Perlu Isi Ulang'
    },
    list: {
      title: 'Daftar Kendaraan',
      showing: 'Menampilkan'
    }
  },
  debug: {
    title: 'Debug Tools',
    dataSourceControl: 'Kontrol Sumber Data',
    deliveriesTest: 'Test Data Pengiriman',
    expensesTest: 'Test Data Pengeluaran',
    vehiclesTest: 'Test Data Kendaraan',
    recordsFound: 'Ditemukan {count} data',
    loading: 'Memuat...',
    error: 'Error: {message}'
  },
  dataSources: {
    mock: 'Data Simulasi',
    mysql: 'MySQL',
    google_sheets: 'Google Sheets'
  }
}
