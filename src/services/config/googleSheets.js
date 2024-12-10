export const sheetsConfig = {
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
  credentials: {
    client_email: process.env.SHEETS_CLIENT_EMAIL,
    private_key: process.env.SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  sheets: {
    deliveries: 'Deliveries',
    expenses: 'Expenses',
    vehicles: 'Vehicles'
  },
  headers: {
    deliveries: [
      'id', 'branch', 'driver', 'helper', 'vehicleNumber', 'date', 'time',
      'customer', 'location', 'invoice', 'amount', 'payment', 'status',
      'proofImage', 'coordinates.lat', 'coordinates.lng'
    ],
    expenses: [
      'id', 'branch', 'date', 'category', 'amount', 'vehicleNumber',
      'driver', 'description', 'status', 'receipt'
    ],
    vehicles: [
      'id', 'plateNumber', 'type', 'model', 'capacity', 'status',
      'lastServiceDate', 'nextServiceDue', 'fuelEfficiency'
    ]
  },
  structure: {
    deliveries: {
      startRow: 2,
      columns: {
        id: 'A',
        branch: 'B',
        driver: 'C',
        helper: 'D',
        vehicleNumber: 'E',
        date: 'F',
        time: 'G',
        customer: 'H',
        location: 'I',
        invoice: 'J',
        amount: 'K',
        payment: 'L',
        status: 'M',
        proofImage: 'N',
        'coordinates.lat': 'O',
        'coordinates.lng': 'P'
      }
    },
    expenses: {
      startRow: 2,
      columns: {
        id: 'A',
        branch: 'B',
        date: 'C',
        category: 'D',
        amount: 'E',
        vehicleNumber: 'F',
        driver: 'G',
        description: 'H',
        status: 'I',
        receipt: 'J'
      }
    },
    vehicles: {
      startRow: 2,
      columns: {
        id: 'A',
        plateNumber: 'B',
        type: 'C',
        model: 'D',
        capacity: 'E',
        status: 'F',
        lastServiceDate: 'G',
        nextServiceDue: 'H',
        fuelEfficiency: 'I'
      }
    }
  }
}
