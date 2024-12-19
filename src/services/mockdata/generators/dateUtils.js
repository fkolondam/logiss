// Date utility functions for mock data generation
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0; // Only Sunday is weekend
};

const isHoliday = (date) => {
  // Convert date to MM/DD/YY format for comparison
  const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  
  const holidays2024 = [
    "11/27/24", // November holiday
    "12/25/24", // Christmas
    "12/31/24"  // New Year's Eve
  ];

  return holidays2024.includes(dateStr);
};

const isWorkingDay = (date) => {
  return !isWeekend(date) && !isHoliday(date);
};

const getWorkingDaysInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const getRandomTimeInWorkingHours = () => {
  // Working hours: 8 AM - 5 PM
  const hour = 8 + Math.floor(Math.random() * 9); // 8-17
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const formatDate = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};

export {
  isWeekend,
  isHoliday,
  isWorkingDay,
  getWorkingDaysInRange,
  getRandomTimeInWorkingHours,
  formatDate
};
