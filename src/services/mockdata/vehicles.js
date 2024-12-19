export const vehiclesMockData = [
  {
    id: 1,
    plateNumber: "B9144SCN",
    type: "Truck",
    model: "Toyota Hilux",
    capacity: "2000 kg",
    status: "active",
    fuelLevel: 85,
    lastServiceDate: "2024-12-01",
    nextServiceDue: "2025-01-01",
    fuelEfficiency: "8.5 km/l",
    documents: {
      insurance: {
        number: "INS-001",
        expiry: "2024-12-31",
        provider: "Asuransi Sinar Mas",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-001",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Jakarta"
      }
    },
    currentLocation: {
      lat: -6.8575162,
      lng: 107.9240116,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "JLN KEBON KOL, SUMEDANG"
    },
    assignedDriver: {
      id: 1,
      name: "SOEBANGKIT",
      license: "SIM-B2-12345",
      phone: "081234567890",
      experience: "5 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-01",
        type: "Regular Service",
        description: "Oil change, brake check",
        cost: 1500000
      },
      {
        date: "2024-11-15",
        type: "Tire Replacement",
        description: "Replace 2 front tires",
        cost: 2400000
      }
    ]
  },
  {
    id: 2,
    plateNumber: "B99871SCM",
    type: "Van",
    model: "Isuzu Elf",
    capacity: "1500 kg",
    status: "active",
    fuelLevel: 45,
    lastServiceDate: "2024-12-05",
    nextServiceDue: "2025-01-05",
    fuelEfficiency: "10 km/l",
    documents: {
      insurance: {
        number: "INS-002",
        expiry: "2024-12-31",
        provider: "Asuransi Jasindo",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-002",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Sumedang"
      }
    },
    currentLocation: {
      lat: -6.846854,
      lng: 107.9234702,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "JL MAYOR ABDURAHMAN, SUMEDANG"
    },
    assignedDriver: {
      id: 2,
      name: "ROHMAT",
      license: "SIM-B2-23456",
      phone: "081234567891",
      experience: "3 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-05",
        type: "Regular Service",
        description: "Full service",
        cost: 1800000
      }
    ]
  },
  {
    id: 3,
    plateNumber: "B9694NCJ",
    type: "Truck",
    model: "Mitsubishi Fuso",
    capacity: "3000 kg",
    status: "maintenance",
    fuelLevel: 25,
    lastServiceDate: "2024-12-10",
    nextServiceDue: "2024-12-20",
    fuelEfficiency: "7.5 km/l",
    documents: {
      insurance: {
        number: "INS-003",
        expiry: "2024-12-31",
        provider: "Asuransi Adira",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-003",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Sukabumi"
      }
    },
    currentLocation: {
      lat: -6.89016,
      lng: 106.7808827,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "CIBADAK, SUKABUMI"
    },
    assignedDriver: {
      id: 3,
      name: "LUTFI",
      license: "SIM-B2-34567",
      phone: "081234567892",
      experience: "4 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-10",
        type: "Major Repair",
        description: "Engine overhaul",
        cost: 15000000
      }
    ]
  },
  {
    id: 4,
    plateNumber: "B9704NCJ",
    type: "Van",
    model: "Daihatsu Gran Max",
    capacity: "1000 kg",
    status: "active",
    fuelLevel: 65,
    lastServiceDate: "2024-12-08",
    nextServiceDue: "2025-01-08",
    fuelEfficiency: "12 km/l",
    documents: {
      insurance: {
        number: "INS-004",
        expiry: "2024-12-31",
        provider: "Asuransi Allianz",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-004",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Jember"
      }
    },
    currentLocation: {
      lat: -8.2612353,
      lng: 113.6502499,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "PASAR JENGAWAH, JEMBER"
    },
    assignedDriver: {
      id: 4,
      name: "ARIF EFENDI",
      license: "SIM-B2-45678",
      phone: "081234567893",
      experience: "6 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-08",
        type: "Regular Service",
        description: "Oil change, brake service",
        cost: 1200000
      }
    ]
  },
  {
    id: 5,
    plateNumber: "B9460SCN",
    type: "Truck",
    model: "Hino Dutro",
    capacity: "2500 kg",
    status: "active",
    fuelLevel: 75,
    lastServiceDate: "2024-12-12",
    nextServiceDue: "2025-01-12",
    fuelEfficiency: "9 km/l",
    documents: {
      insurance: {
        number: "INS-005",
        expiry: "2024-12-31",
        provider: "Asuransi Astra",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-005",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Cianjur"
      }
    },
    currentLocation: {
      lat: -6.827335,
      lng: 107.15058,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "KP TUGU MUNJUL, CIANJUR"
    },
    assignedDriver: {
      id: 5,
      name: "HAERUDIN",
      license: "SIM-B2-56789",
      phone: "081234567894",
      experience: "7 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-12",
        type: "Regular Service",
        description: "Full service",
        cost: 2100000
      }
    ]
  },
  {
    id: 6,
    plateNumber: "DG8171KB",
    type: "Van",
    model: "Suzuki APV",
    capacity: "800 kg",
    status: "maintenance",
    fuelLevel: 20,
    lastServiceDate: "2024-12-14",
    nextServiceDue: "2024-12-24",
    fuelEfficiency: "13 km/l",
    documents: {
      insurance: {
        number: "INS-006",
        expiry: "2024-12-31",
        provider: "Asuransi Wahana Tata",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-006",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Gorontalo"
      }
    },
    currentLocation: {
      lat: 0.5585585585585585,
      lng: 123.03287331075036,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "PALMA, GORONTALO"
    },
    assignedDriver: {
      id: 6,
      name: "AYUB",
      license: "SIM-B2-67890",
      phone: "081234567895",
      experience: "4 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-14",
        type: "Transmission Service",
        description: "Transmission repair",
        cost: 8500000
      }
    ]
  },
  {
    id: 7,
    plateNumber: "B9852SCN",
    type: "Truck",
    model: "Toyota Dyna",
    capacity: "2200 kg",
    status: "active",
    fuelLevel: 55,
    lastServiceDate: "2024-12-13",
    nextServiceDue: "2025-01-13",
    fuelEfficiency: "8.8 km/l",
    documents: {
      insurance: {
        number: "INS-007",
        expiry: "2024-12-31",
        provider: "Asuransi Sinar Mas",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-007",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Sukabumi"
      }
    },
    currentLocation: {
      lat: -6.9503374,
      lng: 106.9330175,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "SINDANG SARI, SUKABUMI"
    },
    assignedDriver: {
      id: 7,
      name: "CECEP",
      license: "SIM-B2-78901",
      phone: "081234567896",
      experience: "5 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-13",
        type: "Regular Service",
        description: "Oil change, filter replacement",
        cost: 1600000
      }
    ]
  },
  {
    id: 8,
    plateNumber: "DB8432FJ",
    type: "Truck",
    model: "Mitsubishi Canter",
    capacity: "2800 kg",
    status: "active",
    fuelLevel: 35,
    lastServiceDate: "2024-12-11",
    nextServiceDue: "2025-01-11",
    fuelEfficiency: "8.2 km/l",
    documents: {
      insurance: {
        number: "INS-008",
        expiry: "2024-12-31",
        provider: "Asuransi Jasindo",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-008",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Manado"
      }
    },
    currentLocation: {
      lat: 1.4468417,
      lng: 125.17706,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "BITUNG, MANADO"
    },
    assignedDriver: {
      id: 8,
      name: "MELKY",
      license: "SIM-B2-89012",
      phone: "081234567897",
      experience: "6 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-11",
        type: "Regular Service",
        description: "Full service",
        cost: 1900000
      }
    ]
  },
  {
    id: 9,
    plateNumber: "DB8809FJ",
    type: "Van",
    model: "Daihatsu Gran Max",
    capacity: "1000 kg",
    status: "active",
    fuelLevel: 15,
    lastServiceDate: "2024-12-09",
    nextServiceDue: "2025-01-09",
    fuelEfficiency: "12 km/l",
    documents: {
      insurance: {
        number: "INS-009",
        expiry: "2024-12-31",
        provider: "Asuransi Adira",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-009",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Manado"
      }
    },
    currentLocation: {
      lat: 1.4964636,
      lng: 124.8429129,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "PELABUHAN, MANADO"
    },
    assignedDriver: {
      id: 9,
      name: "MELDY",
      license: "SIM-B2-90123",
      phone: "081234567898",
      experience: "3 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-09",
        type: "Regular Service",
        description: "Oil change, brake check",
        cost: 1100000
      }
    ]
  },
  {
    id: 10,
    plateNumber: "B9692NCJ",
    type: "Truck",
    model: "Hino Ranger",
    capacity: "3500 kg",
    status: "active",
    fuelLevel: 90,
    lastServiceDate: "2024-12-07",
    nextServiceDue: "2025-01-07",
    fuelEfficiency: "7.8 km/l",
    documents: {
      insurance: {
        number: "INS-010",
        expiry: "2024-12-31",
        provider: "Asuransi Allianz",
        coverage: "Comprehensive"
      },
      registration: {
        number: "REG-010",
        expiry: "2024-12-31",
        type: "Commercial",
        issuedBy: "Samsat Gresik"
      }
    },
    currentLocation: {
      lat: -7.1535774,
      lng: 112.5264626,
      lastUpdate: "2024-12-15T14:30:00Z",
      address: "KEMENDUNG, GRESIK"
    },
    assignedDriver: {
      id: 10,
      name: "RAVI",
      license: "SIM-B2-01234",
      phone: "081234567899",
      experience: "8 years"
    },
    maintenanceHistory: [
      {
        date: "2024-12-07",
        type: "Regular Service",
        description: "Full service",
        cost: 2300000
      }
    ]
  }
];
