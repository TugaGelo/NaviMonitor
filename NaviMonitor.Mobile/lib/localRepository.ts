import { getDb } from './database';
import type { Vehicle } from '../types';

export const DEV_USER_ID = "DEV_USER_GELO";

const generateOfflineId = () => -Math.floor(Math.random() * 999999) - 1;

export const VehicleRepository = {

  async addVehicle(vehicle: Omit<Vehicle, 'id'>) {
    const db = await getDb(); 
    const offlineId = generateOfflineId();

    const safeYear = Number(vehicle.year) || new Date().getFullYear();
    const safeEngineSize = Number(vehicle.engineSizeCC) || 0;
    const safeOdometer = Number(vehicle.startingOdometer) || 0;
    
    const safeExpiry = vehicle.registrationExpiry ? String(vehicle.registrationExpiry) : '';

    await db.runAsync(
      `INSERT INTO Vehicles (
        id, userId, vehicleType, nickname, make, model, year, 
        color, engineSizeCC, startingOdometer, licensePlate, 
        registrationExpiry, hasSyncedManual, is_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        offlineId, DEV_USER_ID, vehicle.vehicleType || 'Car', vehicle.nickname || '',
        vehicle.make || '', vehicle.model || '', safeYear, vehicle.color || '',
        safeEngineSize, safeOdometer, vehicle.licensePlate || '', safeExpiry, 
        vehicle.hasSyncedManual ? 1 : 0
      ]
    );

    return offlineId;
  },

  async getVehicles() {
    const db = await getDb(); 
    const result = await db.getAllAsync<Vehicle>(
      `SELECT * FROM Vehicles WHERE userId = ? ORDER BY id DESC`,
      [DEV_USER_ID]
    );
    return result;
  },

  async deleteVehicle(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM Vehicles WHERE id = ?`, [id]);
  },

  async getVehicleById(id: number) {
    const db = await getDb();
    const result = await db.getFirstAsync<Vehicle>(
      `SELECT * FROM Vehicles WHERE id = ?`, 
      [id]
    );
    return result;
  },

  async updateVehicle(vehicle: Vehicle) {
    const db = await getDb();
    
    const safeYear = Number(vehicle.year) || new Date().getFullYear();
    const safeEngineSize = Number(vehicle.engineSizeCC) || 0;
    const safeOdometer = Number(vehicle.startingOdometer) || 0;
    const safeExpiry = vehicle.registrationExpiry ? String(vehicle.registrationExpiry) : '';

    await db.runAsync(
      `UPDATE Vehicles SET 
        vehicleType = ?, nickname = ?, make = ?, model = ?, year = ?, 
        color = ?, engineSizeCC = ?, startingOdometer = ?, licensePlate = ?, 
        registrationExpiry = ?, is_synced = 0
       WHERE id = ?`,
      [
        vehicle.vehicleType || 'Car', 
        vehicle.nickname || '',
        vehicle.make || '', 
        vehicle.model || '', 
        safeYear, 
        vehicle.color || '',
        safeEngineSize, 
        safeOdometer, 
        vehicle.licensePlate || '', 
        safeExpiry, 
        vehicle.id
      ]
    );
  }
};
