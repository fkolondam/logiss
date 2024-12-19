export default {
  app: {
    title: 'Fleet Management',
    loading: 'Loading...',
    error: 'Error'
  },
  common: {
    close: 'Close',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    viewDetails: 'View Details',
    back: 'Back',
    openInNewTab: 'Open in new tab',
    share: 'Share',
    viewAll: 'View All',
    details: 'Details',
    refresh: 'Refresh',
    of: 'of',
    viewAllVehicles: 'View All Vehicles',
    filters: 'Filters',
    search: 'Search',
    justNow: 'Just now',
    minutesAgo: '{minutes} minutes ago',
    hoursAgo: '{hours} hours ago',
    daysAgo: '{days} days ago'
  },
  menu: {
    home: 'Home',
    deliveries: 'Deliveries',
    expenses: 'Expenses',
    vehicles: 'Vehicles',
    profile: 'Profile',
    logout: 'Logout',
    debug: 'Debug Tools'
  },
  dashboard: {
    title: 'Dashboard',
    recentDeliveries: 'Recent Deliveries',
    noDeliveries: 'No deliveries.',
    refresh: 'Refresh Data',
    deliveryStats: {
      total: 'Total Deliveries',
      succesRate: 'Success Rate',
      completed: 'Completed',
      pending: 'In Progress',
      cancelled: 'Cancelled',
      deliveryStatus: 'Delivery Status',
      todayDeliveries: 'Today\'s Deliveries'
    }
  },
  notifications: {
    title: 'Notifications',
    empty: 'No notifications',
    markAllRead: 'Mark All as Read',
    new: 'New'
  },
  quickActions: {
    title: 'Quick Actions',
    newDelivery: 'New Delivery',
    viewReports: 'View Reports',
    checkVehicles: 'Check Vehicles'
  },
  export: {
    title: 'Export Data',
    deliveries: 'Export Deliveries',
    expenses: 'Export Expenses',
    vehicles: 'Export Vehicles'
  },
  errors: {
    fetchDashboard: 'Failed to load dashboard data',
    fetchDeliveries: 'Failed to load delivery data',
    fetchExpenses: 'Failed to load expense data',
    fetchVehicles: 'Failed to load vehicle data',
    unauthorized: 'Your session has expired',
    forbidden: 'You do not have access',
    notFound: 'Data not found',
    serverError: 'Server error occurred',
    network: 'Failed to connect to server',
    unknown: 'An error occurred'
  },
  deliveries: {
    title: 'Deliveries',
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
        cancelled: 'Delivery cancelled'
      }
    },
    noProofAvailable: 'No delivery proof available',
    paymentMethod: {
      cash: 'Cash',
      kredit: 'Credit'
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
      actions: 'Actions'
    },
    pagination: {
      showing: 'Showing',
      to: 'to',
      of: 'of',
      items: 'items',
      loadMore: 'Load More',
      page: 'Page',
      perPage: 'Per Page'
    },
    status: {
      'diterima - semua': 'Received - All',
      'diterima - sebagian': 'Received - Partial',
      'batal': 'Cancelled',
      'batal - toko tutup': 'Cancelled - Store Closed',
      'batal - toko tidak dapat diakses': 'Cancelled - Store Inaccessible',
      'batal - tidak ada uang': 'Cancelled - No Payment',
      'batal - salah order': 'Cancelled - Wrong Order',
      'kirim ulang': 'Resend'
    },
    tabs: {
      delivery: 'Delivery',
      customer: 'Customer',
      proof: 'Proof'
    },
    stats: {
      todayDeliveries: 'Today\'s Deliveries',
      completionRate: 'Completion Rate',
      thisWeek: 'This Week',
      fromLastWeek: 'from last week',
      thisMonth: 'This Month',
      monthlyTarget: 'Monthly Target'
    }
  },
  expenses: {
    title: 'Expenses',
    total: 'Total',
    periods: {
      month: 'Monthly',
      week: 'Weekly',
      today: 'Today',
      thisMonth: 'This Month',
      thisWeek: 'This Week'
    },
    breakdown: 'Expense Breakdown',
    categories: {
      fuel: 'Fuel',
      maintenance: 'Maintenance',
      insurance: 'Insurance',
      others: 'Others'
    },
    stats: {
      total: 'Total Expenses',
      approved: 'Approved',
      pending: 'Pending'
    }
  },
  vehicles: {
    title: 'Vehicles',
    noVehicles: 'No vehicles.',
    lowFuel: 'Low Fuel',
    driver: 'Driver',
    location: 'Location',
    fuel: 'Fuel Level',
    types: {
      deliveryTruck: 'Delivery Truck',
      van: 'Van',
      pickup: 'Pickup'
    },
    status: {
      active: 'Active',
      maintenance: 'Maintenance',
      inactive: 'Inactive'
    },
    stats: {
      total: 'Total Vehicles',
      totalVehicles: 'Total Fleet',
      active: 'Active Vehicles',
      activeVehicles: 'Currently Operating',
      maintenance: 'In Maintenance',
      maintenanceVehicles: 'Under Service',
      lowFuel: 'Low Fuel',
      lowFuelVehicles: 'Need Refueling'
    },
    list: {
      title: 'Vehicle List',
      showing: 'Showing'
    }
  },
  debug: {
    title: 'Debug Tools',
    dataSourceControl: 'Data Source Control',
    deliveriesTest: 'Test Deliveries Data',
    expensesTest: 'Test Expenses Data',
    vehiclesTest: 'Test Vehicles Data',
    recordsFound: 'Found {count} records',
    loading: 'Loading...',
    error: 'Error: {message}'
  },
  dataSources: {
    mock: 'Mock Data',
    mysql: 'MySQL',
    google_sheets: 'Google Sheets'
  }
}
