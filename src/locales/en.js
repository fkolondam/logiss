export default {
  app: {
    title: 'Fleet Management',
    loading: 'Loading...',
    error: 'Error'
  },
  common: {
    close: 'Close',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    viewDetails: 'View Details',
    back: 'Back',
    openInNewTab: 'Open in new tab',
    share: 'Share',
    viewAll: 'View All',
    details: 'Details',
    refresh: 'Refresh'
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
    noDeliveries: 'No deliveries found.',
    deliveryStats: {
      total: 'Total Deliveries',
      succesRate: 'Success Rate',
      completed: 'Completed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      deliveryStatus: 'Delivery Status'
    }
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
    noDeliveries: 'No Deliveries Found',
    noDeliveriesDesc: 'There are no deliveries to display at the moment.',
    tooltips: {
      search: 'Search deliveries by invoice, customer, or location',
      filter: 'Filter deliveries by status or date',
      status: {
        delivered: 'Delivery completed successfully',
        partial: 'Delivery partially completed',
        cancelled: 'Delivery was cancelled'
      }
    },
    noProofAvailable: 'No proof image available',
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
      paymentMethod: 'Payment Method',
      details: 'Details',
      actions: 'Actions'
    },
    status: {
      'diterima - semua': 'Delivered',
      'diterima - sebagian': 'Partially Delivered',
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
      todayDeliveries: 'Today Deliveries',
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
    noVehicles: 'No vehicles found.',
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
      activeVehicles: 'In Operation',
      maintenance: 'In Maintenance',
      maintenanceVehicles: 'Under Service',
      lowFuel: 'Low Fuel',
      lowFuelVehicles: 'Need Refuel'
    },
    list: {
      title: 'Vehicle List',
      showing: 'Showing'
    }
  },
  debug: {
    title: 'Debug Tools',
    dataSourceControl: 'Data Source Control',
    deliveriesTest: 'Deliveries Data Test',
    expensesTest: 'Expenses Data Test',
    vehiclesTest: 'Vehicles Data Test',
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
