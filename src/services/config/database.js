export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logiss',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  tables: {
    deliveries: 'deliveries',
    expenses: 'expenses',
    vehicles: 'vehicles'
  },
  // SQL table schemas for reference
  schemas: {
    deliveries: `
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch VARCHAR(100) NOT NULL,
        driver VARCHAR(100) NOT NULL,
        helper VARCHAR(100),
        vehicleNumber VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        customer VARCHAR(200) NOT NULL,
        location TEXT NOT NULL,
        invoice VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) DEFAULT 0,
        payment ENUM('TUNAI', 'KREDIT') NOT NULL,
        status VARCHAR(50) NOT NULL,
        proofImage TEXT,
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `,
    expenses: `
      CREATE TABLE IF NOT EXISTS expenses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        vehicleNumber VARCHAR(20) NOT NULL,
        driver VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        receipt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `,
    vehicles: `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plateNumber VARCHAR(20) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        capacity VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        lastServiceDate DATE,
        nextServiceDue DATE,
        fuelEfficiency VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  }
}
