import { DataProvider } from '../interfaces/DataProvider'
import mysql from 'mysql2/promise'
import { dbConfig } from '../config/database'

export class MySQLProvider extends DataProvider {
  constructor() {
    super()
    this.connection = null
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createPool(dbConfig)
    }
    return this.connection
  }

  async fetch(resource, params = {}) {
    const conn = await this.connect()
    let query = `SELECT * FROM ${resource}`
    const values = []

    // Handle filtering
    if (params.filter) {
      const conditions = Object.entries(params.filter)
        .map(([key, value]) => {
          values.push(value)
          return `${key} = ?`
        })
        .join(' AND ')
      query += ` WHERE ${conditions}`
    }

    // Handle sorting
    if (params.sort) {
      const [field, order] = params.sort.split(',')
      query += ` ORDER BY ${field} ${order.toUpperCase()}`
    }

    // Handle pagination
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit
      query += ` LIMIT ? OFFSET ?`
      values.push(parseInt(params.limit), offset)
    }

    const [rows] = await conn.execute(query, values)
    return rows
  }

  async create(resource, data) {
    const conn = await this.connect()
    const fields = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)

    const query = `INSERT INTO ${resource} (${fields}) VALUES (${placeholders})`
    const [result] = await conn.execute(query, values)
    
    return { ...data, id: result.insertId }
  }

  async update(resource, id, data) {
    const conn = await this.connect()
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ')
    const values = [...Object.values(data), id]

    const query = `UPDATE ${resource} SET ${fields} WHERE id = ?`
    await conn.execute(query, values)
    
    return { ...data, id }
  }

  async delete(resource, id) {
    const conn = await this.connect()
    const query = `DELETE FROM ${resource} WHERE id = ?`
    const [result] = await conn.execute(query, [id])
    
    return result.affectedRows > 0
  }
}
