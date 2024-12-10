import { DataProvider } from '../interfaces/DataProvider'
import { google } from 'googleapis'
import { sheetsConfig } from '../config/googleSheets'

export class GoogleSheetsProvider extends DataProvider {
  constructor() {
    super()
    this.sheets = null
    this.auth = null
  }

  async initialize() {
    if (!this.auth) {
      this.auth = new google.auth.GoogleAuth({
        credentials: sheetsConfig.credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })
      
      const client = await this.auth.getClient()
      this.sheets = google.sheets({ version: 'v4', auth: client })
    }
  }

  async fetch(resource, params = {}) {
    await this.initialize()
    
    const sheetId = sheetsConfig.sheets[resource]
    if (!sheetId) {
      throw new Error(`No sheet configured for resource: ${resource}`)
    }

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A2:Z`, // Assuming first row is headers
    })

    let data = this.convertRowsToObjects(response.data.values || [], resource)

    // Handle filtering
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        data = data.filter(item => item[key] === value)
      })
    }

    // Handle sorting
    if (params.sort) {
      const [field, order] = params.sort.split(',')
      data.sort((a, b) => {
        if (order === 'desc') {
          return b[field] > a[field] ? 1 : -1
        }
        return a[field] > b[field] ? 1 : -1
      })
    }

    // Handle pagination
    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit
      data = data.slice(start, start + parseInt(params.limit))
    }

    return data
  }

  async create(resource, data) {
    await this.initialize()
    
    const sheetId = sheetsConfig.sheets[resource]
    if (!sheetId) {
      throw new Error(`No sheet configured for resource: ${resource}`)
    }

    const values = this.convertObjectToRow(data, resource)
    
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A2:Z`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    })

    return data
  }

  async update(resource, id, data) {
    await this.initialize()
    
    const sheetId = sheetsConfig.sheets[resource]
    if (!sheetId) {
      throw new Error(`No sheet configured for resource: ${resource}`)
    }

    // Find the row with the matching ID
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A2:Z`,
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === id.toString()) + 2 // +2 for header row and 0-based index

    if (rowIndex < 2) {
      throw new Error(`Record with id ${id} not found`)
    }

    const values = this.convertObjectToRow({ ...data, id }, resource)
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    })

    return { ...data, id }
  }

  async delete(resource, id) {
    await this.initialize()
    
    const sheetId = sheetsConfig.sheets[resource]
    if (!sheetId) {
      throw new Error(`No sheet configured for resource: ${resource}`)
    }

    // Note: Google Sheets API doesn't support direct row deletion
    // Instead, we'll clear the row's content
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A2:Z`,
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === id.toString()) + 2

    if (rowIndex < 2) {
      return false
    }

    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: `${sheetId}!A${rowIndex}:Z${rowIndex}`,
    })

    return true
  }

  // Helper methods for data conversion
  convertRowsToObjects(rows, resource) {
    const headers = sheetsConfig.headers[resource]
    return rows.map(row => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || null
      })
      return obj
    })
  }

  convertObjectToRow(obj, resource) {
    const headers = sheetsConfig.headers[resource]
    return headers.map(header => obj[header] || '')
  }
}
