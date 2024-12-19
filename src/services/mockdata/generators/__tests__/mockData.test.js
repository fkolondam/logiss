import { describe, test, expect } from 'vitest';
import { generateMockData } from '../index';

describe('Mock Data Generation', () => {
  const mockData = generateMockData();

  test('should generate deliveries data correctly', () => {
    const { deliveries } = mockData;
    
    // Basic validation
    expect(Array.isArray(deliveries)).toBe(true);
    expect(deliveries.length).toBeGreaterThan(0);

    // Sample validation
    const sampleDelivery = deliveries[0];
    expect(sampleDelivery).toHaveProperty('branch');
    expect(sampleDelivery).toHaveProperty('date');
    expect(sampleDelivery).toHaveProperty('status');
    expect(sampleDelivery).toHaveProperty('amount');

    // Log statistics
    const branchCounts = deliveries.reduce((acc, del) => {
      acc[del.branch] = (acc[del.branch] || 0) + 1;
      return acc;
    }, {});
    console.log('\nDeliveries per branch:', branchCounts);

    const statusCounts = deliveries.reduce((acc, del) => {
      acc[del.status] = (acc[del.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Deliveries by status:', statusCounts);
  });

  test('should generate expenses data correctly', () => {
    const { expenses } = mockData;
    
    // Basic validation
    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length).toBeGreaterThan(0);

    // Sample validation
    const sampleExpense = expenses[0];
    expect(sampleExpense).toHaveProperty('branch');
    expect(sampleExpense).toHaveProperty('date');
    expect(sampleExpense).toHaveProperty('category');
    expect(sampleExpense).toHaveProperty('amount');

    // Log statistics
    const categoryCounts = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {});
    console.log('\nExpenses per category:', categoryCounts);

    const categoryAmounts = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    console.log('Total amount per category:', categoryAmounts);
  });

  test('should generate vehicles data correctly', () => {
    const { vehicles } = mockData;
    
    // Basic validation
    expect(Array.isArray(vehicles)).toBe(true);
    expect(vehicles.length).toBeGreaterThan(0);

    // Sample validation
    const sampleVehicle = vehicles[0];
    expect(sampleVehicle).toHaveProperty('plateNumber');
    expect(sampleVehicle).toHaveProperty('type');
    expect(sampleVehicle).toHaveProperty('status');
    expect(sampleVehicle).toHaveProperty('fuelLevel');

    // Log statistics
    const typeCounts = vehicles.reduce((acc, veh) => {
      acc[veh.type] = (acc[veh.type] || 0) + 1;
      return acc;
    }, {});
    console.log('\nVehicles by type:', typeCounts);

    const statusCounts = vehicles.reduce((acc, veh) => {
      acc[veh.status] = (acc[veh.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Vehicles by status:', statusCounts);
  });

  test('should generate data for correct date range', () => {
    const { deliveries, expenses } = mockData;

    // Check if dates are within Q4 2024
    const startDate = new Date(2024, 9, 1); // Month is 0-based, so 9 is October
    const endDate = new Date(2024, 11, 31, 23, 59, 59, 999); // December

    // Helper function to parse MM/DD/YY format
    const parseDate = (dateStr) => {
      const [month, day, year] = dateStr.split('/').map(Number);
      // Create date at noon to avoid timezone issues
      return new Date(2000 + year, month - 1, day, 12, 0, 0, 0);
    };

    // Check deliveries dates
    deliveries.forEach(delivery => {
      const deliveryDate = parseDate(delivery.date);
      const isInRange = deliveryDate >= startDate && deliveryDate <= endDate;
      if (!isInRange) {
        console.log('Invalid delivery date:', {
          date: delivery.date,
          parsed: deliveryDate.toISOString(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }
      expect(isInRange).toBe(true);
    });

    // Check expenses dates
    expenses.forEach(expense => {
      const expenseDate = parseDate(expense.date);
      const isInRange = expenseDate >= startDate && expenseDate <= endDate;
      if (!isInRange) {
        console.log('Invalid expense date:', {
          date: expense.date,
          parsed: expenseDate.toISOString(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }
      expect(isInRange).toBe(true);
    });
  });
});
