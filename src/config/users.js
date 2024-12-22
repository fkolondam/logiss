/**
 * @typedef {import('../services/interfaces/AccessControl').User} User
 */

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
  },
  {
    id: 'rm_jatim',
    name: 'Regional Manager Jawa Timur',
    role: 'regional_manager',
    scope: { type: 'region', value: 'JAWA TIMUR' },
  },
  {
    id: 'rm_sulawesi',
    name: 'Regional Manager Sulawesi',
    role: 'regional_manager',
    scope: { type: 'region', value: 'SULAWESI' },
  },

  // Branch Managers
  {
    id: 'bm_sumedang',
    name: 'Branch Manager Sumedang',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA SUMEDANG' },
  },
  {
    id: 'bm_jember',
    name: 'Branch Manager Jember',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA JEMBER' },
  },
  {
    id: 'bm_manado',
    name: 'Branch Manager Manado',
    role: 'branch_manager',
    scope: { type: 'branch', value: 'RDA MANADO' },
  },

  // Staff
  {
    id: 'staff_sumedang1',
    name: 'Staff Sumedang',
    role: 'staff',
    scope: { type: 'branch', value: 'RDA SUMEDANG' },
  },

  // Operational Users (Drivers/Helpers)
  {
    id: 'driver_sumedang1',
    name: 'SOEBANGKIT',
    role: 'operational',
    scope: { type: 'personal', value: 'SOEBANGKIT' },
  },
]

/**
 * Role definitions with permissions
 */
export const roles = {
  admin: {
    level: 'global',
    permissions: ['all'],
  },
  regional_manager: {
    level: 'region',
    permissions: ['read_all', 'write_region'],
  },
  branch_manager: {
    level: 'branch',
    permissions: ['read_branch', 'write_branch'],
  },
  staff: {
    level: 'branch',
    permissions: ['read_limited', 'read_branch_expenses', 'read_branch_deliveries'],
  },
  operational: {
    level: 'personal',
    permissions: [
      // Read permissions
      'read_personal',
      'read_assigned_vehicle',
      // Write permissions for operational tasks
      'write_delivery',
      'write_expense_fuel',
      'write_expense_parking',
      'write_expense_toll',
      'write_expense_retribution',
      'write_expense_labor',
    ],
    // Expense categories they can manage
    allowedExpenseCategories: ['Fuel', 'Parking-Tol-Retribution', 'Labour'],
  },
}

/**
 * Permission definitions for expense categories
 */
export const expensePermissions = {
  // Categories that operational users can manage
  operational: ['Fuel', 'Parking-Tol-Retribution', 'Labour'],
  // Categories that require higher level approval
  restricted: ['Maintenance', 'Vehicle License', 'Insurance', 'Other'],
}
