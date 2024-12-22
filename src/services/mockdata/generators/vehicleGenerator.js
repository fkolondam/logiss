import { branchConfig, vehicleStatusConfig } from './branchData.js'
import { getWorkingDaysInRange, formatDate } from './dateUtils.js'
import { getRandomNumber, getRandomCoordinates } from './randomUtils.js'

const generateVehicleData = (startDate, endDate) => {
  const vehicles = []
  const workingDays = getWorkingDaysInRange(new Date(startDate), new Date(endDate))
  const maintenanceSchedule = generateMaintenanceSchedule(workingDays)

  // Generate base vehicle data for each branch
  Object.entries(branchConfig).forEach(([branchName, branchData]) => {
    const { vehicles: branchVehicles, drivers, coordinates } = branchData

    branchVehicles.forEach((plateNumber, index) => {
      const driver = drivers[index]
      const baseVehicle = generateBaseVehicle(plateNumber, branchName, driver, coordinates)

      // Add maintenance history
      baseVehicle.maintenanceHistory = generateMaintenanceHistory(
        plateNumber,
        maintenanceSchedule,
        workingDays,
      )

      vehicles.push(baseVehicle)
    })
  })

  return vehicles
}

const generateBaseVehicle = (plateNumber, branch, driver, coordinates) => {
  const vehicleTypes = {
    B: 'Truck',
    D: 'Van',
  }

  const vehicleModels = {
    Truck: [
      'Toyota Hilux',
      'Mitsubishi Fuso',
      'Hino Dutro',
      'Toyota Dyna',
      'Mitsubishi Canter',
      'Hino Ranger',
    ],
    Van: ['Isuzu Elf', 'Daihatsu Gran Max', 'Suzuki APV'],
  }

  const type = vehicleTypes[plateNumber[0]] || 'Truck'
  const model = vehicleModels[type][Math.floor(Math.random() * vehicleModels[type].length)]

  const capacityRanges = {
    Truck: { min: 2000, max: 3500 },
    Van: { min: 800, max: 1500 },
  }

  const capacity = getRandomNumber(capacityRanges[type].min, capacityRanges[type].max)
  const fuelEfficiency =
    type === 'Truck'
      ? getRandomNumber(7, 9) + '.' + getRandomNumber(0, 9)
      : getRandomNumber(10, 13) + '.' + getRandomNumber(0, 9)

  // Generate location within branch radius
  const location = getRandomCoordinates(
    coordinates.center.lat,
    coordinates.center.lng,
    coordinates.radius,
  )

  return {
    id: parseInt(plateNumber.replace(/\D/g, '').slice(-4)),
    plateNumber,
    branch,
    region: branchConfig[branch].region,
    type,
    model,
    capacity: capacity + ' kg',
    status: Math.random() < 0.8 ? 'active' : 'maintenance', // 80% active, 20% maintenance
    fuelLevel:
      Math.random() < 0.2 // 20% chance of low fuel
        ? getRandomNumber(0, vehicleStatusConfig.fuelLevel.refillTrigger)
        : getRandomNumber(
            vehicleStatusConfig.fuelLevel.startDay.min,
            vehicleStatusConfig.fuelLevel.startDay.max,
          ),
    lastServiceDate: formatDate(new Date()),
    nextServiceDue: formatDate(new Date(new Date().setDate(new Date().getDate() + 30))),
    fuelEfficiency: fuelEfficiency + ' km/l',
    documents: generateDocuments(branch),
    currentLocation: {
      lat: location.lat,
      lng: location.lng,
      lastUpdate: new Date().toISOString(),
      address: driver.location || 'Main Depot',
    },
    assignedDriver: {
      id: parseInt(plateNumber.replace(/\D/g, '').slice(-4)),
      name: driver.name,
      license: 'SIM-B2-' + getRandomNumber(10000, 99999),
      phone: '08' + getRandomNumber(1000000000, 9999999999),
      experience: getRandomNumber(3, 8) + ' years',
    },
    maintenanceHistory: [],
  }
}

const generateDocuments = (branch) => {
  const providers = [
    'Asuransi Sinar Mas',
    'Asuransi Jasindo',
    'Asuransi Adira',
    'Asuransi Allianz',
    'Asuransi Astra',
  ]
  const currentYear = new Date().getFullYear()

  return {
    insurance: {
      number: 'INS-' + getRandomNumber(1000, 9999),
      expiry: currentYear + '-12-31',
      provider: providers[Math.floor(Math.random() * providers.length)],
      coverage: 'Comprehensive',
    },
    registration: {
      number: 'REG-' + getRandomNumber(1000, 9999),
      expiry: currentYear + '-12-31',
      type: 'Commercial',
      issuedBy: 'Samsat ' + branch.split(' ')[1],
    },
  }
}

const generateMaintenanceSchedule = (workingDays) => {
  const schedule = {}
  const interval = vehicleStatusConfig.maintenanceSchedule.interval

  workingDays.forEach((date, index) => {
    if (index % interval === 0) {
      schedule[formatDate(date)] = true
    }
  })

  return schedule
}

const generateMaintenanceHistory = (plateNumber, schedule, workingDays) => {
  const history = []
  const maintenanceTypes = [
    {
      type: 'Regular Service',
      description: 'Oil change, brake check',
      costRange: [1000000, 2000000],
    },
    { type: 'Major Service', description: 'Full service', costRange: [2000000, 3000000] },
    { type: 'Tire Replacement', description: 'Replace tires', costRange: [2000000, 2500000] },
    {
      type: 'Brake Service',
      description: 'Brake system maintenance',
      costRange: [1500000, 2000000],
    },
  ]

  workingDays.forEach((date) => {
    const dateStr = formatDate(date)
    if (schedule[dateStr]) {
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)]
      history.push({
        date: dateStr,
        type: maintenanceType.type,
        description: maintenanceType.description,
        cost: getRandomNumber(maintenanceType.costRange[0], maintenanceType.costRange[1]),
      })
    }
  })

  return history
}

export { generateVehicleData }
