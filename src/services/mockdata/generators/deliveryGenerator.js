import { branchConfig, amountRanges, deliveryStatusConfig, paymentMethodConfig } from './branchData';
import { getWorkingDaysInRange, getRandomTimeInWorkingHours, formatDate } from './dateUtils';
import { 
  getRandomAmount, 
  getRandomItem, 
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl
} from './randomUtils';

const generateDeliveryData = (startDate, endDate) => {
  const deliveries = [];
  let deliveryIndex = 0;

  // Get all working days in the date range
  const workingDays = getWorkingDaysInRange(new Date(startDate), new Date(endDate));

  // Generate deliveries for each branch
  Object.entries(branchConfig).forEach(([branchName, branchData]) => {
    const { vehicles, drivers, customers, coordinates } = branchData;
    
    // For each working day
    workingDays.forEach(date => {
      // Generate 8-12 deliveries per day for each branch
      const dailyDeliveryCount = Math.floor(Math.random() * 5) + 8;

      // Assign vehicles and drivers for the day
      const dayVehicle = getRandomItem(vehicles);
      const dayDriver = getRandomItem(drivers);

      for (let i = 0; i < dailyDeliveryCount; i++) {
        // Get random customer
        const customer = getRandomItem(customers);

        // Generate random coordinates within branch radius
        const deliveryCoords = getRandomCoordinates(
          coordinates.center.lat,
          coordinates.center.lng,
          coordinates.radius
        );

        // Determine amount range based on probabilities
        const amountRange = Math.random() < 0.4 ? amountRanges.small :
                          Math.random() < 0.75 ? amountRanges.medium :
                          amountRanges.large;

        // Generate delivery data
        const delivery = {
          id: 14900 + deliveryIndex,
          branch: branchName,
          driver: dayDriver.name,
          helper: dayDriver.helper,
          vehicleNumber: dayVehicle,
          date: formatDate(date),
          time: getRandomTimeInWorkingHours(),
          customer: customer.name,
          location: customer.location,
          invoice: generateInvoiceNumber(branchName, date, deliveryIndex),
          amount: getRandomAmount(amountRange.min, amountRange.max),
          status: getRandomStatus(deliveryStatusConfig),
          coordinates: deliveryCoords,
          paymentMethod: Math.random() < paymentMethodConfig.TUNAI ? "TUNAI" : "KREDIT"
        };

        // Add proof image after other fields are set
        delivery.proofImage = generateProofImageUrl(delivery.branch, delivery.invoice);

        deliveries.push(delivery);
        deliveryIndex++;
      }
    });
  });

  // Sort deliveries by date and time
  return deliveries.sort((a, b) => {
    const dateA = new Date(a.date + " " + a.time);
    const dateB = new Date(b.date + " " + b.time);
    return dateA - dateB;
  });
};

export { generateDeliveryData };
