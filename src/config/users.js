/**
 * @typedef {import('../services/interfaces/AccessControl').User} User
 */

/**
 * Region to Branch mapping
 */
export const regionBranches = {
  'JAWA BARAT': ['RDA SUMEDANG', 'RDA CIANJUR', 'RDA CIREBON'],
  'JAWA TIMUR': ['RDA JEMBER', 'RDA SURABAYA', 'RDA GRESIK'],
  SULAWESI: ['RDA MANADO', 'RDA GORONTALO', 'RDA PALU'],
}

/**
 * Predefined users for testing different access levels
 * @type {Array<User>}
 */
export const predefinedUsers = [
  // Global Admin
  {
    id: 'admin1',
    name: 'Global Admin',
    role: 'admin',
    scope: { type: 'global' },
  },

  // Regional Managers
  {
    id: 'rm_jabar',
    name: 'Regional Manager Jawa Barat',
    role: 'regional_manager',
    scope: { type: 'region', value: 'JAWA BARAT' },
    branches: regionBranches['JAWA BARAT'],
  },
  {
    id: 'rm_jatim',
    name: 'Regional Manager Jawa Timur',
    role: 'regional_manager',
    scope: { type: 'region', value: 'JAWA TIMUR' },
    branches: regionBranches['JAWA TIMUR'],
  },
  {
    id: 'rm_sulawesi',
    name: 'Regional Manager Sulawesi',
    role: 'regional_manager',
    scope: { type: 'region', value: 'SULAWESI' },
    branches: regionBranches['SULAWESI'],
  },

  // Branch Managers
  {
    id: 'bm_sumedang',
    name: 'Branch Manager Sumedang',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA SUMEDANG' },
    region: 'JAWA BARAT',
  },
  {
    id: 'bm_jember',
    name: 'Branch Manager Jember',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA JEMBER' },
    region: 'JAWA TIMUR',
  },
  {
    id: 'bm_manado',
    name: 'Branch Manager Manado',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA MANADO' },
    region: 'SULAWESI',
  },

  // Staff
  {
    id: 'staff_sumedang1',
    name: 'Staff Sumedang',
    role: 'staff',
    scope: { type: 'branch', value: 'RDA SUMEDANG' },
    region: 'JAWA BARAT',
  },

  // Operational Users (Drivers/Helpers)
  {
    id: 'driver_sumedang1',
    name: 'SOEBANGKIT',
    role: 'operational',
    scope: { type: 'personal', value: 'SOEBANGKIT' },
    assignedVehicle: 'B9144SCN',
    branch: 'RDA SUMEDANG',
    region: 'JAWA BARAT',
  },
]

/**
 * Role definitions with permissions and view access
 */
export const roles = {
  // Global Admin - Full access to everything
  admin: {
    level: 'global',
    permissions: ['all'],
    viewAccess: ['dashboard', 'deliveries', 'expenses', 'vehicles'],
    allowedOperations: ['read', 'write', 'approve', 'delete'],
    description: 'Full access to all data and operations',
  },

  // Regional Manager - Access to region and branch data
  regional_manager: {
    level: 'region',
    permissions: [
      'read_region_data',
      'read_branch_data',
      'write_region_data',
      'write_branch_data',
      'approve_region_expenses',
      'approve_branch_expenses',
      'view_region_dashboard',
      'view_branch_dashboard',
      'manage_region_vehicles',
      'manage_branch_vehicles',
    ],
    viewAccess: ['dashboard', 'deliveries', 'expenses', 'vehicles'],
    allowedOperations: ['read', 'write', 'approve'],
    canAccessBranches: true,
    description: 'Access to regional and branch data and operations',
  },

  // Branch Manager - Read-only access to branch data
  branch_manager: {
    level: 'branch',
    permissions: [
      'read_branch_data',
      'view_branch_dashboard',
      'view_branch_expenses',
      'view_branch_deliveries',
      'view_branch_vehicles',
    ],
    viewAccess: ['dashboard', 'deliveries', 'expenses', 'vehicles'],
    allowedOperations: ['read'],
    description: 'View-only access to branch data',
  },

  // Staff - Branch level with expense management
  staff: {
    level: 'branch',
    permissions: [
      'read_branch_data',
      'write_branch_expenses',
      'approve_branch_expenses',
      'view_branch_dashboard',
      'view_branch_deliveries',
      'view_branch_vehicles',
    ],
    viewAccess: ['dashboard', 'deliveries', 'expenses', 'vehicles'],
    allowedOperations: ['read', 'write_expenses', 'approve_expenses'],
    expenseCategories: ['Fuel', 'Maintenance', 'Labour', 'Parking-Tol-Retribution'],
    description: 'Branch access with expense management',
  },

  // Operational - Personal dashboard and operations
  operational: {
    level: 'personal',
    permissions: [
      'read_personal_data',
      'write_delivery',
      'write_expenses',
      'view_personal_dashboard',
      'view_assigned_vehicle',
    ],
    viewAccess: ['personal_dashboard', 'deliveries', 'expenses'],
    allowedOperations: ['read_personal', 'write_delivery', 'write_expenses'],
    expenseCategories: ['Fuel', 'Parking-Tol-Retribution', 'Labour'],
    requiresVehicleAssignment: true,
    description: 'Personal access with delivery and expense operations',
  },
}

/**
 * Permission definitions for expense categories
 */
export const expensePermissions = {
  // Categories that operational users can manage
  operational: ['Fuel', 'Parking-Tol-Retribution', 'Labour'],
  // Categories that staff can manage
  staff: ['Fuel', 'Maintenance', 'Labour', 'Parking-Tol-Retribution'],
  // Categories that require higher level approval
  restricted: ['Vehicle License', 'Insurance', 'Other'],
}

/**
 * View access definitions per role
 */
export const viewAccess = {
  // Main dashboard view
  dashboard: {
    admin: 'full',
    regional_manager: 'region_and_branches',
    branch_manager: 'branch',
    staff: 'branch',
    operational: 'none',
  },
  // Personal dashboard view (for operational users)
  personal_dashboard: {
    admin: 'full',
    regional_manager: 'none',
    branch_manager: 'none',
    staff: 'none',
    operational: 'personal',
  },
  // Deliveries view
  deliveries: {
    admin: 'full',
    regional_manager: 'region_and_branches',
    branch_manager: 'branch',
    staff: 'branch',
    operational: 'personal',
  },
  // Expenses view
  expenses: {
    admin: 'full',
    regional_manager: 'region_and_branches',
    branch_manager: 'branch_readonly',
    staff: 'branch_manage',
    operational: 'personal_input',
  },
  // Vehicles view
  vehicles: {
    admin: 'full',
    regional_manager: 'region_and_branches',
    branch_manager: 'branch',
    staff: 'branch',
    operational: 'assigned',
  },
}

/**
 * Dashboard view configurations per role
 */
export const dashboardConfig = {
  admin: {
    showGlobalStats: true,
    showRegionalComparison: true,
    showAllExpenses: true,
    showAllVehicles: true,
  },
  regional_manager: {
    showRegionStats: true,
    showBranchComparison: true,
    showBranchDetails: true,
    showRegionExpenses: true,
    showBranchExpenses: true,
    showRegionVehicles: true,
    showBranchVehicles: true,
  },
  branch_manager: {
    showBranchStats: true,
    showBranchExpenses: true,
    showBranchVehicles: true,
    showBranchDeliveries: true,
  },
  staff: {
    showBranchStats: true,
    showBranchExpenses: true,
    showBranchVehicles: true,
    showBranchDeliveries: true,
  },
  operational: {
    showPersonalStats: true,
    showAssignedVehicle: true,
    showPersonalDeliveries: true,
    showPersonalExpenses: true,
    focusOnVehicleHistory: true,
  },
}
