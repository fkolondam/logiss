import { branchConfig, expenseCategoryConfig } from './branchData.js'
import { getWorkingDaysInRange, formatDate } from './dateUtils.js'
import { getRandomAmount, generateProofImageUrl } from './randomUtils.js'

const generateExpenseData = (startDate, endDate) => {
  const expenses = []
  let expenseIndex = 1

  // Get all working days in the date range
  const workingDays = getWorkingDaysInRange(new Date(startDate), new Date(endDate))

  // Generate expenses for each branch
  Object.entries(branchConfig).forEach(([branchName, branchData]) => {
    const { vehicles } = branchData

    // For each vehicle in the branch
    vehicles.forEach((vehicleNumber) => {
      // Get assigned driver for this vehicle
      const driver = Object.values(branchData.drivers).find(
        (d) => branchData.vehicles.indexOf(vehicleNumber) === branchData.drivers.indexOf(d),
      )

      // For each expense category
      Object.entries(expenseCategoryConfig).forEach(([category, config]) => {
        const { frequency, range } = config

        // Generate expenses based on frequency
        workingDays.forEach((date) => {
          const shouldGenerateExpense = (() => {
            switch (frequency) {
              case 'daily':
                return true
              case 'weekly':
                return date.getDay() === 1 // Monday
              case 'biweekly':
                return date.getDate() === 1 || date.getDate() === 15
              case 'monthly':
                return date.getDate() === 1
              default:
                return false
            }
          })()

          if (shouldGenerateExpense) {
            const expense = {
              id: expenseIndex++,
              branch: branchName,
              date: formatDate(date),
              category,
              amount: getRandomAmount(range.min, range.max),
              vehicleNumber,
              driver: driver.name,
              description: generateDescription(category),
              status: getExpenseStatus(date),
              receipt: generateProofImageUrl(branchName, 'EXP' + expenseIndex),
            }

            expenses.push(expense)
          }
        })
      })
    })
  })

  // Sort expenses by date
  return expenses.sort((a, b) => new Date(a.date) - new Date(b.date))
}

// Helper function to generate description based on category
const generateDescription = (category) => {
  const descriptions = {
    Fuel: ['Fuel refill', 'Fuel expense', 'Fuel top-up', 'Fuel replenishment'],
    Maintenance: [
      'Regular service',
      'Monthly maintenance',
      'Routine maintenance',
      'Vehicle maintenance',
    ],
    'Vehicle License': [
      'License renewal',
      'Registration fee',
      'Vehicle registration',
      'License fee',
    ],
    Labour: ['Labour expense', 'Workman charges', 'Labour work', 'Labour charge'],
    'Parking-Tol-Retribution': [
      'Toll fee',
      'Parking charges',
      'Toll and parking',
      'Parking and toll charges',
    ],
  }

  return descriptions[category][Math.floor(Math.random() * descriptions[category].length)]
}

// Helper function to determine expense status based on date
const getExpenseStatus = (date) => {
  const today = new Date()
  const expenseDate = new Date(date)

  if (expenseDate > today) {
    return 'pending'
  }

  // 90% approved, 10% rejected for past expenses
  return Math.random() < 0.9 ? 'approved' : 'rejected'
}

export { generateExpenseData }
