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
    periods: {
      today: 'Today',
      this_week: 'This Week',
      this_month: 'This Month',
      custom: 'Custom',
    },
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
    personal: {
      title: 'Personal Deliveries',
    },
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
      'minta kirim ulang': 'Request Resend',
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
    periods: {
      today: 'Today',
      yesterday: 'Day Before',
      this_week: 'This Week',
      last_week: 'Last Week',
      this_month: 'This Month',
      last_month: 'Last Month',
    },
  },
  expenses: {
    title: 'Expenses',
    total: 'Total Expenses',
    breakdown: 'Expense Breakdown',
    increased: 'Increased',
    decreased: 'Decreased',
    noExpenses: 'No expenses',
    categories: {
      fuel: 'Fuel',
      maintenance: 'Maintenance',
      vehicleLicense: 'Vehicle License & Tax',
      labour: 'Unloading Labour',
      toll: 'Toll',
      parking: 'Parking',
      retribution: 'Retribution',
    },
    stats: {
      total: 'Total',
      approved: 'Approved',
      pending: 'Pending',
    },
    periods: {
      today: 'Today',
      yesterday: 'Day Before',
      this_week: 'This Week',
      last_week: 'Last Week',
      this_month: 'This Month',
      last_month: 'Last Month',
    },
  },
  vehicles: {
    title: 'Vehicles',
    noVehicles: 'No vehicles.',
    function: {
      title: 'Vehicle Function',
      passenger: 'Passenger Vehicles',
      logistic: 'Logistic Vehicles',
    },
    logisticType: {
      title: 'Logistic Types',
      '4 RODA L': '4-Wheeler Logistics',
      '6 RODA L': '6-Wheeler Logistics',
      'MOTOR L': 'Motorcycle Logistics',
    },
    ownership: {
      title: 'Ownership Type',
      SEWA: 'Rental',
      MILIK: 'Owned',
    },
    documents: {
      title: 'Documents & Service',
      expiry: 'Document Expiry Status',
      expiring: 'Expiring',
      thisMonth: 'this month',
      nextThreeMonths: 'in next 3 months',
      tax: 'Annual Tax',
      warning: 'Some vehicles require immediate attention',
    },
    attention: {
      title: 'Vehicles Needing Attention',
    },
    stats: {
      total: 'Total Vehicles',
      byFunction: 'By Function',
      byType: 'By Type',
      byOwnership: 'By Ownership',
    },
    periods: {
      today: 'Today',
      yesterday: 'Day Before',
      this_week: 'This Week',
      last_week: 'Last Week',
      this_month: 'This Month',
      last_month: 'Last Month',
    },
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
    operation: 'Field Operator',
    staff: 'Branch Logistic SPV',
    branch_manager: 'Branch Manager',
    regional_manager: 'Regional Operational Manager',
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
  permissions: {
    read_branch_data: 'Read Branch Data',
    write_branch_expenses: 'Write Branch Expenses',
    approve_branch_expenses: 'Approve Branch Expenses',
    view_branch_dashboard: 'View Branch Dashboard',
    view_branch_deliveries: 'View Branch Deliveries',
    view_branch_vehicles: 'View Branch Vehicles',
    read_region_data: 'Read Region Data',
    write_region_data: 'Write Region Data',
    write_branch_data: 'Write Branch Data',
    approve_region_expenses: 'Approve Region Expenses',
    view_region_dashboard: 'View Region Dashboard',
    manage_region_vehicles: 'Manage Region Vehicles',
    manage_branch_vehicles: 'Manage Branch Vehicles',
    view_branch_expenses: 'View Branch Expenses',
    read_personal_data: 'Read Personal Data',
    write_delivery: 'Input Delivery',
    write_expenses: 'Input Expenses',
    view_personal_dashboard: 'View Personal Dashboard',
    view_assigned_vehicle: 'View Assigned Vehicle',
    all: 'All Permissions',
  },
  profile: {
    title: 'Profile', // 'Profil'
    comingSoon: 'Coming Soon', // 'Segera Hadir'
  },
}
