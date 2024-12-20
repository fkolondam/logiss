const BRANCHES = [
  {
    id: 'SMD',
    name: 'RDA SUMEDANG',
    lat: -6.8575162,
    lng: 107.9240116,
    drivers: ['SOEBANGKIT', 'ROHMAT', 'ALFIAN', 'BUDI', 'ANDI'],
    vehicles: ['B9144SCN', 'B99871SCM', 'B1177QWE', 'B4455ASD', 'B3344VBN'],
    radius: 5 // km
  },
  {
    id: 'SKB',
    name: 'RDA SUKABUMI',
    lat: -6.9503374,
    lng: 106.9330175,
    drivers: ['LUTFI', 'CECEP'],
    vehicles: ['B9694NCJ', 'B9852SCN'],
    radius: 5
  },
  {
    id: 'JBR',
    name: 'RDA JEMBER',
    lat: -8.2612353,
    lng: 113.6502499,
    drivers: ['ARIF EFENDI', 'FAQIH', 'RUDI', 'HADI', 'RAHMAT'],
    vehicles: ['B9704NCJ', 'B9620SCN', 'B1122DEF', 'B2334STU', 'B7788NSD'],
    radius: 5
  },
  {
    id: 'CJR',
    name: 'RDA CIANJUR',
    lat: -6.827335,
    lng: 107.15058,
    drivers: ['HAERUDIN', 'MARTIN', 'JOHAN'],
    vehicles: ['B9460SCN', 'B7889DFG', 'B9988JKL', 'B7788TGH', 'B7788JKL'],
    radius: 5
  },
  {
    id: 'GTO',
    name: 'RDA GORONTALO',
    lat: 0.5585585585585585,
    lng: 123.03287331075036,
    drivers: ['AYUB', 'SOEBANGKIT', 'RAHMAT'],
    vehicles: ['DG8171KB', 'B5566JKL', 'B4455TYU', 'B2233POI', 'B4455JKL'],
    radius: 5
  },
  {
    id: 'MDO',
    name: 'RDA MANADO',
    lat: 1.4468417,
    lng: 125.17706,
    drivers: ['MELKY', 'MELDY', 'JONO', 'ANTON', 'ALFIAN'],
    vehicles: ['DB8432FJ', 'DB8809FJ', 'B1234ABC', 'B9087XYZ', 'B2233ASD'],
    radius: 5
  },
  {
    id: 'GRK',
    name: 'RDA GRESIK',
    lat: -7.1535774,
    lng: 112.5264626,
    drivers: ['MARTIN', 'RAVI', 'ANDI', 'RAHMAT'],
    vehicles: ['B9677NCJ', 'B9692NCJ', 'B3344GHI', 'B2233JKL', 'B2333FTY'],
    radius: 5
  }
]

// Calculate distances between branches using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c) // Distance in km
}

function toRad(deg) {
  return deg * Math.PI / 180
}

// Pre-calculate all distances
const distances = {}
BRANCHES.forEach((origin, i) => {
  BRANCHES.forEach((dest, j) => {
    if (i !== j) {
      const distance = calculateDistance(
        origin.lat, origin.lng,
        dest.lat, dest.lng
      )
      distances[`${origin.id}-${dest.id}`] = distance
    }
  })
})

// Invoice number prefixes for each branch
const INVOICE_PREFIXES = {
  'RDA SUMEDANG': '241110',
  'RDA SUKABUMI': 'SIL241109',
  'RDA JEMBER': 'STP/JBR-AABD-',
  'RDA CIANJUR': 'SIL241106',
  'RDA GORONTALO': 'SI241103',
  'RDA MANADO': 'AABD',
  'RDA GRESIK': 'STP/GRS-AABD-'
}

export function generateBranchData() {
  return {
    branches: BRANCHES,
    distances,
    invoicePrefixes: INVOICE_PREFIXES
  }
}
