import { getDb } from './database';
import type { Vehicle, RefuelLog } from '../types';

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
  },

  async getVehicleStats(vehicleId: number) {
    const db = await getDb();

    const vehicle = await db.getFirstAsync<{startingOdometer: number}>(
      `SELECT startingOdometer FROM Vehicles WHERE id = ?`, [vehicleId]
    );
    const startingOdo = vehicle?.startingOdometer || 0;

    const fuelStats = await db.getFirstAsync<{totalFuelCost: number, maxOdo: number, minOdo: number, totalVol: number}>(
      `SELECT 
        SUM(totalCost) as totalFuelCost, 
        MAX(odometer) as maxOdo, 
        MIN(odometer) as minOdo, 
        SUM(volume) as totalVol 
       FROM RefuelLogs WHERE vehicleId = ?`, 
      [vehicleId]
    );

    const maintStats = await db.getFirstAsync<{totalMaintCost: number, maxOdo: number}>(
      `SELECT 
        SUM(price) as totalMaintCost, 
        MAX(odometer) as maxOdo 
       FROM MaintenanceLogs WHERE vehicleId = ?`, 
      [vehicleId]
    );

    const totalSpent = (fuelStats?.totalFuelCost || 0) + (maintStats?.totalMaintCost || 0);

    const currentOdo = Math.max(
      startingOdo,
      fuelStats?.maxOdo || 0,
      maintStats?.maxOdo || 0
    );

    let avgEfficiency = 0;
    if (fuelStats && fuelStats.totalVol > 0 && fuelStats.maxOdo > fuelStats.minOdo) {
      avgEfficiency = (fuelStats.maxOdo - fuelStats.minOdo) / fuelStats.totalVol;
    }

    return {
      totalSpent,
      currentOdo,
      avgEfficiency: avgEfficiency.toFixed(1)
    };
  },

  async getVehicleTimeline(vehicleId: number) {
    const db = await getDb();

    const refuels = await db.getAllAsync<any>(
      `SELECT *, 'Refuel' as feedType FROM RefuelLogs WHERE vehicleId = ?`, 
      [vehicleId]
    );

    const maints = await db.getAllAsync<any>(
      `SELECT *, logType as feedType FROM MaintenanceLogs WHERE vehicleId = ?`, 
      [vehicleId]
    );

    const timeline = [...refuels, ...maints].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return timeline;
  },

  async addRefuelLog(log: Omit<RefuelLog, 'id' | 'is_synced'>) {
    const db = await getDb();
    const offlineId = generateOfflineId();

    await db.runAsync(
      `INSERT INTO RefuelLogs (
        id, vehicleId, date, odometer, volume, totalCost, fuelType, is_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        offlineId, 
        log.vehicleId, 
        log.date, 
        log.odometer, 
        log.volume, 
        log.totalCost, 
        log.fuelType || 'Unleaded'
      ]
    );

    return offlineId;
  }
};
