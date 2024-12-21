// Branch data configuration for mock data generation
const branchConfig = {
  'RDA SUMEDANG': {
    region: 'JAWA BARAT',
    coordinates: {
      center: {
        lat: -6.8575162,
        lng: 107.9240116,
      },
      radius: 15, // km
    },
    vehicles: ['B9144SCN', 'B99871SCM'],
    drivers: [
      { name: 'SOEBANGKIT', helper: 'DENINURJAMAN' },
      { name: 'ROHMAT', helper: 'DEDE' },
    ],
    customers: [
      { name: 'HIDAYAT', location: 'JLN CIPANCAR' },
      { name: 'YANTO 2', location: 'JLN BABAKAN REGOL' },
      { name: 'SELVIE', location: 'JLN SAMOJA' },
      { name: 'MICRO MART', location: 'JLN KEBON KOL' },
      { name: 'AL BAROKAH', location: 'JLN SONDA' },
      { name: 'ADE SUMBER REZEKI', location: 'JLN TOGA' },
      { name: 'PT ASIA TRITUNGGAL JAYA', location: 'JL MAYOR ABDURAHMAN' },
      { name: 'LIEM', location: 'JL PANYINGKIRAN' },
      { name: 'SINAR FASIFIK', location: 'JL CIKARAMAS' },
      { name: 'TEH AI', location: 'JL CIKARAMAS' },
    ],
  },
  'RDA SUKABUMI': {
    region: 'JAWA BARAT',
    coordinates: {
      center: {
        lat: -6.89016,
        lng: 106.7808827,
      },
      radius: 12,
    },
    vehicles: ['B9694NCJ', 'B9852SCN'],
    drivers: [
      { name: 'LUTFI', helper: 'YUSUP' },
      { name: 'CECEP', helper: 'ACE' },
    ],
    customers: [
      { name: 'MT CIBADAK', location: 'CIBADAK' },
      { name: 'SELAMAT CIMANGKOK', location: 'CIMANGKOK DEPAN GSI' },
      { name: 'TOKO KABUT', location: 'SINDANG SARI' },
      { name: 'NIA TK', location: 'JL TATA NUGRAHA' },
      { name: 'FARIS MART', location: 'SINDANG SARI' },
    ],
  },
  'RDA JEMBER': {
    region: 'JAWA TIMUR',
    coordinates: {
      center: {
        lat: -8.2612353,
        lng: 113.6502499,
      },
      radius: 20,
    },
    vehicles: ['B9704NCJ', 'B9620SCN'],
    drivers: [
      { name: 'ARIF EFENDI', helper: 'ATHOK' },
      { name: 'FAQIH', helper: 'FERDI' },
    ],
    customers: [
      { name: 'B YUDI', location: 'PASAR JENGAWAH' },
      { name: 'PT. INDOMARCO PRISMATAMA (DC JEMBER)', location: 'JL. PIERE TENDEAN SUMBERSARI' },
      { name: 'PANCA JAUA', location: 'PANTI' },
      { name: 'NADIA', location: 'DUSUN KANTONG' },
    ],
  },
  'RDA CIANJUR': {
    region: 'JAWA BARAT',
    coordinates: {
      center: {
        lat: -6.827335,
        lng: 107.15058,
      },
      radius: 15,
    },
    vehicles: ['B9460SCN'],
    drivers: [{ name: 'HAERUDIN', helper: 'INDRA' }],
    customers: [
      { name: 'H IYAN', location: 'KP TUGU MUNJUL SALAERIH SUKAMANAH' },
      { name: 'ANDRE', location: 'JL RY HALTE MALEBER' },
      { name: 'SALWA', location: 'JL HALTE MALEBER' },
      { name: 'SRC MAMAT', location: 'JL MALEBER KEC KARANG TENGAH' },
    ],
  },
  'RDA GORONTALO': {
    region: 'SULAWESI',
    coordinates: {
      center: {
        lat: 0.5585585585585585,
        lng: 123.03287331075036,
      },
      radius: 25,
    },
    vehicles: ['DG8171KB'],
    drivers: [{ name: 'AYUB', helper: 'ZULKIFLI MALANGO' }],
    customers: [
      { name: 'SALSABILA MART', location: 'PALMA' },
      { name: 'SAZKIA', location: 'KOMBOS TIMUR' },
      { name: 'MAKRO', location: 'KOTA SELATAN' },
      { name: 'IRA', location: 'IMAM BONJOL' },
    ],
  },
  'RDA MANADO': {
    region: 'SULAWESI',
    coordinates: {
      center: {
        lat: 1.4468417,
        lng: 125.17706,
      },
      radius: 30,
    },
    vehicles: ['DB8432FJ', 'DB8809FJ'],
    drivers: [
      { name: 'MELKY', helper: 'AHMAD' },
      { name: 'MELDY', helper: 'KRISTIN' },
    ],
    customers: [
      { name: 'USAHA MANDIRI', location: 'BITUNG' },
      { name: 'MADURA', location: 'BITUNG' },
      { name: 'NONA CINDY', location: 'KEMA' },
      { name: 'BINA KARYA SANANA', location: 'PELABUHAN' },
    ],
  },
  'RDA GRESIK': {
    region: 'JAWA TIMUR',
    coordinates: {
      center: {
        lat: -7.1535774,
        lng: 112.5264626,
      },
      radius: 18,
    },
    vehicles: ['B9677NCJ', 'B9692NCJ'],
    drivers: [
      { name: 'MARTIN', helper: 'JUN' },
      { name: 'RAVI', helper: 'TUNJUNG' },
    ],
    customers: [
      { name: 'VILLA JAYA', location: 'KEMENDUNG GRESIK' },
      { name: 'YUSUF', location: 'PASAR DUKUN' },
    ],
  },
}

// Amount ranges for different transaction sizes
const amountRanges = {
  small: { min: 50000, max: 500000 },
  medium: { min: 500001, max: 2000000 },
  large: { min: 2000001, max: 15000000 },
}

// Status distribution configuration
const deliveryStatusConfig = {
  'DITERIMA - SEMUA': 0.7,
  'DITERIMA - SEBAGIAN': 0.15,
  'KIRIM ULANG': 0.05,
  'BATAL - TOKO TUTUP': 0.025,
  'BATAL - TIDAK ADA UANG': 0.025,
  'BATAL - SALAH ORDER': 0.025,
  'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.025,
}

// Payment method distribution
const paymentMethodConfig = {
  TUNAI: 0.6,
  KREDIT: 0.4,
}

// Expense categories configuration
const expenseCategoryConfig = {
  Fuel: {
    frequency: 'daily',
    range: { min: 300000, max: 1000000 },
  },
  Maintenance: {
    frequency: 'biweekly',
    range: { min: 800000, max: 2500000 },
  },
  'Vehicle License': {
    frequency: 'monthly',
    range: { min: 400000, max: 800000 },
  },
  Labour: {
    frequency: 'weekly',
    range: { min: 600000, max: 1000000 },
  },
  'Parking-Tol-Retribution': {
    frequency: 'daily',
    range: { min: 300000, max: 500000 },
  },
}

// Vehicle status configuration
const vehicleStatusConfig = {
  fuelLevel: {
    startDay: { min: 80, max: 100 },
    midDay: { min: 40, max: 60 },
    endDay: { min: 20, max: 40 },
    refillTrigger: 30,
  },
  maintenanceSchedule: {
    interval: 14, // days
    duration: 1, // days
  },
}

export {
  branchConfig,
  amountRanges,
  deliveryStatusConfig,
  paymentMethodConfig,
  expenseCategoryConfig,
  vehicleStatusConfig,
}
