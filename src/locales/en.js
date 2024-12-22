export default {
  app: {
    title: 'Logistics Dashboard',
    loading: 'Loading...',
    error: 'An error occurred',
  },
  common: {
    viewAll: 'View All',
    details: 'Details',
    viewDetails: 'View Details',
    close: 'Close',
    openInNewTab: 'Open in New Tab',
    share: 'Share',
    done: 'Done',
    'toggle-sidebar': 'Toggle Sidebar',
  },
  menu: {
    home: 'Home',
    deliveries: 'Deliveries',
    expenses: 'Expenses',
    vehicles: 'Vehicles',
    profile: 'Profile',
    logout: 'Logout',
    debug: 'Debug Tools',
    selectUser: 'Select User',
  },
  dataSelector: {
    title: 'Data Selector',
    source: 'Data Source',
    scope: 'Scope',
    filterBy: 'Filter By',
    filters: {
      recent: 'Recent',
      favorites: 'Favorites',
    },
    loading: 'Loading data sources...',
    error: 'Failed to load data sources',
    select: 'Select data source',
    noData: 'No data available',
    searchPlaceholder: 'Search...', // 'Cari...'
    noResults: 'No results found', // 'Tidak ada hasil'
    description: 'Select data source and scope', // 'Pilih sumber data dan cakupan'
    resetScope: 'Reset scope', // 'Reset cakupan'
    selectScope: 'Select scope', // 'Pilih cakupan'
  },
  scope: {
    global: 'Global Access',
    region: 'Region',
    branch: 'Branch',
    personal: 'Personal',
    regions: 'Regions',
    branches: 'Branches',
    select: 'Select Scope',
    all: 'All',
    allData: 'All Data',
    level: {
      global: 'Global Access',
      region: 'Region Access',
      branch: 'Branch Access',
      personal: 'Personal Access',
    },
  },
  dashboard: {
    title: 'Dashboard',
    refresh: 'Refresh Data',
    noAccess: 'You do not have access to dashboard data',
    overview: 'Overview',
    details: 'Details',
    recentDeliveries: 'Recent Deliveries',
    noDeliveries: 'No deliveries.',
    deliveryStats: {
      total: 'Total Deliveries',
      completed: 'Completed',
      pending: 'In Progress',
      cancelled: 'Cancelled',
      deliveryStatus: 'Delivery Status',
      todayDeliveries: "Today's Deliveries",
    },
  },
  deliveries: {
    title: 'Deliveries',
    today: 'Today',
    deliveryStatus: 'Delivery Status',
    details: 'Delivery Details',
    loading: 'Loading deliveries...',
    search: 'Search deliveries...',
    filter: 'Filter',
    searchPlaceholder: 'Search customer or location',
    allStatus: 'All Status',
    allPayments: 'All Payments',
    resetFilters: 'Reset Filters',
    viewDetails: 'View Details',
    noDeliveries: 'No Deliveries',
    noDeliveriesDesc: 'No deliveries to display at this time.',
    tooltips: {
      search: 'Search deliveries by invoice, customer, or location',
      filter: 'Filter deliveries by status or date',
      status: {
        delivered: 'Delivery completed',
        partial: 'Partial delivery',
        cancelled: 'Delivery cancelled',
      },
    },
    noProofAvailable: 'No delivery proof available',
    paymentMethod: {
      cash: 'Cash',
      credit: 'Credit',
    },
    table: {
      invoice: 'Invoice',
      date: 'Date',
      time: 'Time',
      customer: 'Customer',
      location: 'Location',
      amount: 'Amount',
      status: 'Status',
      driver: 'Driver',
      licensePlate: 'License Plate',
      shipment: 'Shipment',
      paymentMethod: 'Payment Method',
      details: 'Details',
      actions: 'Actions',
    },
    pagination: {
      showing: 'Showing',
      to: 'to',
      of: 'of',
      items: 'items',
      loadMore: 'Load More',
      page: 'Page',
      perPage: 'Per Page',
    },
    status: {
      completed: 'Completed',
      in_transit: 'In Transit',
      pending: 'Pending',
      cancelled: 'Cancelled',
      'diterima - semua': 'Received - All',
      'diterima - sebagian': 'Received - Partial',
      batal: 'Cancel',
      'batal - toko tutup': 'Cancel - Store Closed',
      'batal - toko tidak dapat diakses': 'Cancel - Store Inaccessible',
      'batal - tidak ada uang': 'Cancel - No Money',
      'batal - salah order': 'Cancel - Wrong Order',
      'kirim ulang': 'Resend',
    },
    tabs: {
      delivery: 'Delivery',
      customer: 'Customer',
      proof: 'Proof',
    },
    stats: {
      todayDeliveries: "Today's Deliveries",
      completionRate: 'Completion Rate',
      thisWeek: 'This Week',
      fromLastWeek: 'from last week',
      thisMonth: 'This Month',
      monthlyTarget: 'Monthly Target',
    },
  },
  expenses: {
    title: 'Expenses',
    total: 'Total Expenses',
    breakdown: 'Expense Breakdown',
    increased: 'Increased',
    decreased: 'Decreased',
    noExpenses: 'No expenses',
    periods: {
      today: 'Today',
      week: 'Weekly',
      month: 'Monthly',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
    },
    categories: {
      fuel: 'Fuel',
      maintenance: 'Maintenance',
      toll: 'Toll',
      parking: 'Parking',
      retribution: 'Retribution',
      labour: 'Labour/Manpower',
      insurance: 'Insurance',
      others: 'Others',
    },
    stats: {
      total: 'Total',
      approved: 'Approved',
      pending: 'Pending',
    },
  },
  vehicles: {
    title: 'Vehicles',
    noVehicles: 'No vehicles.',
    lowFuel: 'Low Fuel',
    driver: 'Driver',
    noDriver: 'No Driver Assigned',
    location: 'Location',
    locationUnknown: 'Location Unknown',
    fuel: 'Fuel Level',
    types: {
      deliveryTruck: 'Delivery Truck',
      van: 'Van',
      pickup: 'Pickup',
    },
    status: {
      title: 'Vehicle Status',
      active: 'Active',
      maintenance: 'Maintenance',
      inactive: 'Inactive',
    },
    stats: {
      total: 'Total Vehicles',
      active: 'Active Vehicles',
      maintenance: 'In Maintenance',
      maintenanceVehicles: 'In Service',
      lowFuel: 'Low Fuel',
      lowFuelVehicles: 'Need Refuel',
      utilization: 'Utilization Rate',
      maintenanceRate: 'Maintenance Rate',
      needRefuel: 'Need Refuel',
    },
    list: {
      title: 'Vehicle List',
      showing: 'Showing',
    },
    warnings: {
      lowFuel: 'Low Fuel',
    },
    documents: {
      title: 'Documents & Service',
      expiring: 'Documents Expiring',
      nextExpiry: 'Next Document Expiry',
      warning: 'Some vehicles require immediate attention',
    },
    service: {
      due: 'Service Due',
      nextDue: 'Next Service Due',
    },
    nextService: 'Next Service',
  },
  debug: {
    title: 'Debug Tools',
    dataSourceControl: 'Data Source Control',
    deliveriesTest: 'Test Deliveries Data',
    expensesTest: 'Test Expenses Data',
    vehiclesTest: 'Test Vehicles Data',
    recordsFound: 'Found {count} records',
    loading: 'Loading...',
    error: 'Error: {message}',
  },
  dataSources: {
    mock: 'Mock Data',
    mysql: 'MySQL',
    google_sheets: 'Google Sheets',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    profile: 'Profile',
  },
  language: {
    select: 'Select Language',
    en: 'English',
    id: 'Bahasa Indonesia',
  },
  notifications: {
    title: 'Notifications',
    empty: 'No notifications',
  },
  roles: {
    admin: 'Administrator',
    manager: 'Manager',
    user: 'User',
  },
  errors: {
    fetchDeliveries: 'Failed to fetch deliveries', // 'Gagal mengambil data pengiriman'
    fetchExpenses: 'Failed to fetch expenses', // 'Gagal mengambil data pengeluaran'
    fetchVehicles: 'Failed to fetch vehicles', // 'Gagal mengambil data kendaraan'
    fetchDashboard: 'Failed to fetch dashboard', // 'Gagal mengambil data dashboard'
    invalidDateRange: 'Invalid date range', // 'Rentang tanggal tidak valid'
    fetchFailed: 'Failed to fetch data', // 'Gagal mengambil data'
    allSectionsFailed: 'All sections failed to load', // 'Semua bagian gagal dimuat'
    someSectionsFailed: 'Some sections failed to load', // 'Beberapa bagian gagal dimuat'
    unexpectedError: 'An unexpected error occurred', // 'Terjadi kesalahan tidak terduga'
    refreshError: 'Failed to refresh data', // 'Gagal menyegarkan data'
    initError: 'Failed to initialize', // 'Gagal menginisialisasi'
    code: 'Error code', // 'Kode kesalahan'
  },

  userSelector: {
    searchPlaceholder: 'Search users...', // 'Cari pengguna...'
    accessLevel: 'Access Level', // 'Level Akses'
    permissions: 'Permissions', // 'Izin'
    permissionsCount: '{count} permissions', // '{count} izin'
    selectUser: 'Select User', // 'Pilih Pengguna'
  },
  profile: {
    title: 'Profile', // 'Profil'
    comingSoon: 'Coming Soon', // 'Segera Hadir'
  },
}
