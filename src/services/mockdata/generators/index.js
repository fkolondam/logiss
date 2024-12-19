import { generateDeliveryData } from './deliveryGenerator.js';
import { generateExpenseData } from './expenseGenerator.js';
import { generateVehicleData } from './vehicleGenerator.js';

const generateMockData = () => {
  // Set date range for Q4 2024
  const startDate = new Date('2024-10-01');
  const endDate = new Date('2024-12-31');

  // Generate all mock data
  const deliveries = generateDeliveryData(startDate, endDate);
  const expenses = generateExpenseData(startDate, endDate);
  const vehicles = generateVehicleData(startDate, endDate);

  return {
    deliveries,
    expenses,
    vehicles
  };
};

// Generate and export mock data
const mockData = generateMockData();

export {
  generateMockData,
  generateDeliveryData,
  generateExpenseData,
  generateVehicleData,
  mockData
};

export const deliveriesMockData = mockData.deliveries;
export const expensesMockData = mockData.expenses;
export const vehiclesMockData = mockData.vehicles;
