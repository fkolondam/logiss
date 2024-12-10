export const vehiclesMockData = [
  {
    id: 1,
    plateNumber: "B 1234 XYZ",
    type: "Truck",
    model: "Toyota Hilux",
    capacity: "2000 kg",
    status: "active",
    lastServiceDate: "2024-01-10",
    nextServiceDue: "2024-02-10",
    fuelEfficiency: "8.5 km/l",
    documents: {
      insurance: {
        number: "INS-001",
        expiry: "2024-12-31"
      },
      registration: {
        number: "REG-001",
        expiry: "2024-06-30"
      }
    },
    currentLocation: {
      lat: -6.121435,
      lng: 106.774124,
      lastUpdate: "2024-01-15T14:30:00Z"
    },
    assignedDriver: {
      id: 1,
      name: "John Doe"
    }
  },
  {
    id: 2,
    plateNumber: "L 5678 ABC",
    type: "Van",
    model: "Isuzu Elf",
    capacity: "1500 kg",
    status: "maintenance",
    lastServiceDate: "2023-12-20",
    nextServiceDue: "2024-01-20",
    fuelEfficiency: "10 km/l",
    documents: {
      insurance: {
        number: "INS-002",
        expiry: "2024-12-31"
      },
      registration: {
        number: "REG-002",
        expiry: "2024-08-31"
      }
    },
    currentLocation: {
      lat: -7.275973,
      lng: 112.808304,
      lastUpdate: "2024-01-15T14:30:00Z"
    },
    assignedDriver: {
      id: 2,
      name: "Jane Smith"
    }
  }
]
