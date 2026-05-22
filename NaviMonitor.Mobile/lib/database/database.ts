import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('navimonitor.db');
  }
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDb();
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Vehicles (
      id INTEGER PRIMARY KEY,
      serverId INTEGER,
      userId TEXT NOT NULL,
      vehicleType TEXT NOT NULL,
      nickname TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      color TEXT,
      engineSizeCC INTEGER NOT NULL,
      startingOdometer INTEGER NOT NULL,
      licensePlate TEXT NOT NULL,
      registrationExpiry TEXT,
      hasSyncedManual INTEGER DEFAULT 0,
      maintenanceMatrixJson TEXT,
      is_synced INTEGER DEFAULT 0,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS RefuelLogs (
      id INTEGER PRIMARY KEY,
      serverId INTEGER,
      vehicleId INTEGER NOT NULL,
      date TEXT NOT NULL,
      odometer INTEGER NOT NULL,
      volume REAL NOT NULL,
      totalCost REAL NOT NULL,
      fuelType TEXT,
      is_synced INTEGER DEFAULT 0,
      updatedAt TEXT,
      FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MaintenanceLogs (
      id INTEGER PRIMARY KEY,
      serverId INTEGER,
      vehicleId INTEGER NOT NULL,
      logType TEXT NOT NULL,
      serviceCategory TEXT,
      date TEXT NOT NULL,
      odometer INTEGER NOT NULL,
      serviceType TEXT NOT NULL,
      price REAL NOT NULL,
      isDIY INTEGER NOT NULL,
      shopName TEXT,
      mechanicName TEXT,
      contactNumber TEXT,
      notes TEXT,
      nextServiceOdometer INTEGER,
      nextServiceDate TEXT,
      tirePosition TEXT,
      is_synced INTEGER DEFAULT 0,
      updatedAt TEXT,
      FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
    );
  `);

  return db;
}
