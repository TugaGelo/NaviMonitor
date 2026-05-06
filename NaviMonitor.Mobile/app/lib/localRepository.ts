import * as SQLite from 'expo-sqlite';
import type { Vehicle } from '../../types';

export const DEV_USER_ID = "DEV_USER_GELO";

const generateOfflineId = () => -Math.floor(Math.random() * 999999) - 1;

export const VehicleRepository = {
  
  async addVehicle(vehicle: Omit<Vehicle, 'id'>) {
    const db = await SQLite.openDatabaseAsync('navimonitor.db');
    const offlineId = generateOfflineId();
    
    await db.runAsync(
      `INSERT INTO Vehicles (
        id, userId, vehicleType, nickname, make, model, year, 
        color, engineSizeCC, startingOdometer, licensePlate, 
        registrationExpiry, hasSyncedManual, is_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        offlineId, DEV_USER_ID, vehicle.vehicleType, vehicle.nickname, 
        vehicle.make, vehicle.model, vehicle.year, vehicle.color || '', 
        vehicle.engineSizeCC, vehicle.startingOdometer, vehicle.licensePlate, 
        vehicle.registrationExpiry || null, vehicle.hasSyncedManual ? 1 : 0
      ]
    );

    return offlineId;
  },

  async getVehicles() {
    const db = await SQLite.openDatabaseAsync('navimonitor.db');
    const result = await db.getAllAsync<Vehicle>(
      `SELECT * FROM Vehicles WHERE userId = ? ORDER BY id DESC`, 
      [DEV_USER_ID]
    );
    return result;
  }
};
