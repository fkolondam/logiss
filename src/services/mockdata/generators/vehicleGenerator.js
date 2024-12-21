import { faker } from '@faker-js/faker'
import { getRandomCoordinates, getFuelLevel } from './randomUtils'
import { formatDate, getRandomTimeInWorkingHours } from './dateUtils'
import { generateBranchData } from './branchData'

const VEHICLE_STATUSES = ['AVAILABLE', 'IN_USE', 'OUT_OF_SERVICE']

const INSURANCE_PROVIDERS = [
  'Asuransi Sinar Mas',
  'Asuransi Jasindo',
  'Asuransi Adira',
  'Asuransi Allianz',
  'Asuransi Astra',
  'Asuransi Wahana Tata',
]

const MAINTENANCE_TYPES = [
  'Regular Service',
  'Major Repair',
  'Tire Replacement',
  'Transmission Service',
]

export function generateVehicles(count = 20) {
  try {
    console.log('Generating vehicles...')
    // Get branch data
    const { branches } = generateBranchData()

    // Generate vehicles for each branch
    const allVehicles = branches.flatMap((branch) => {
      return branch.vehicles.map((plateNumber, index) => {
        // Select random driver from branch
        const driver = faker.helpers.arrayElement(branch.drivers)

        // Generate maintenance dates
        const lastServiceDate = faker.date.between({
          from: new Date('2024-12-01'),
          to: new Date('2024-12-15'),
        })

        const nextServiceDue = faker.date.between({
          from: new Date('2024-12-20'),
          to: new Date('2025-01-15'),
        })

        // Generate current location within branch radius
        const currentLocation = getRandomCoordinates(
          branch.lat,
          branch.lng,
          branch.radius || 5, // Default radius of 5km if not specified
        )

        // Generate base fuel level and adjust based on time
        const baseFuelLevel = faker.number.int({ min: 15, max: 90 })
        const currentTime = getRandomTimeInWorkingHours()
        const fuelLevel = getFuelLevel(baseFuelLevel, currentTime)

        // Generate type and capacity based on plate number pattern
        const type = plateNumber.includes('SCN') || plateNumber.includes('NCJ') ? 'Truck' : 'Van'
        const capacity =
          type === 'Truck'
            ? `${faker.number.int({ min: 2000, max: 3500 })} kg`
            : `${faker.number.int({ min: 800, max: 1500 })} kg`

        // Generate fuel efficiency based on type
        const fuelEfficiency =
          type === 'Truck'
            ? `${faker.number.float({ min: 7.5, max: 9.0, precision: 0.1 })} km/l`
            : `${faker.number.float({ min: 10.0, max: 13.0, precision: 0.1 })} km/l`

        // Determine status based on conditions
        let status
        if (fuelLevel < 30) {
          status = 'OUT_OF_SERVICE' // Low fuel
        } else if (faker.date.recent({ days: 7 }).getTime() === lastServiceDate.getTime()) {
          status = 'OUT_OF_SERVICE' // Recent maintenance
        } else {
          status = faker.helpers.arrayElement(['AVAILABLE', 'IN_USE'])
        }

        return {
          id: index + 1,
          plateNumber,
          type,
          model: type === 'Truck' ? 'Toyota Hilux' : 'Daihatsu Gran Max',
          capacity,
          status,
          fuelLevel,
          lastServiceDate: formatDate(lastServiceDate),
          nextServiceDue: formatDate(nextServiceDue),
          fuelEfficiency,
          documents: {
            insurance: {
              number: `INS-${String(index + 1).padStart(3, '0')}`,
              expiry: '2024-12-31',
              provider: faker.helpers.arrayElement(INSURANCE_PROVIDERS),
              coverage: 'Comprehensive',
            },
            registration: {
              number: `REG-${String(index + 1).padStart(3, '0')}`,
              expiry: '2024-12-31',
              type: 'Commercial',
              issuedBy: `Samsat ${branch.name.replace('RDA ', '')}`,
            },
          },
          currentLocation: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            lastUpdate: '2024-12-15T14:30:00Z',
            address: faker.location.streetAddress().toUpperCase(),
          },
          assignedDriver: {
            id: index + 1,
            name: driver,
            branch: branch.name,
            license: `SIM-B2-${faker.number.int({ min: 10000, max: 99999 })}`,
            phone: `08${faker.number.int({ min: 1000000000, max: 9999999999 })}`,
            experience: `${faker.number.int({ min: 3, max: 8 })} years`,
          },
          maintenanceHistory: [
            {
              date: formatDate(lastServiceDate),
              type: faker.helpers.arrayElement(MAINTENANCE_TYPES),
              description: faker.helpers.arrayElement([
                'Oil change, brake check',
                'Full service',
                'Engine overhaul',
                'Oil change, brake service',
                'Oil change, filter replacement',
              ]),
              cost: faker.number.int({ min: 1000000, max: 15000000 }),
            },
          ],
        }
      })
    })

    // Return only the requested number of vehicles
    const vehicles = allVehicles.slice(0, count)
    console.log('Generated vehicles:', vehicles.length)
    return vehicles
  } catch (error) {
    console.error('Error generating vehicles:', error)
    return []
  }
}
