import { getDb } from '../database/database';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEV_USER_ID = "DEV_USER_GELO";

const generateOfflineId = () => -Math.floor(Math.random() * 999999) - 1;

export const VehicleRepository = {

  async addVehicle(vehicle: Omit<Vehicle, 'id'>) {
    const db = await getDb();
    const offlineId = generateOfflineId();
    const now = new Date().toISOString();

    const safeYear = Number(vehicle.year) || new Date().getFullYear();
    const safeEngineSize = Number(vehicle.engineSizeCC) || 0;
    const safeOdometer = Number(vehicle.startingOdometer) || 0;
    const safeExpiry = vehicle.registrationExpiry ? String(vehicle.registrationExpiry) : '';

    await db.runAsync(
      `INSERT INTO Vehicles (
        id, userId, vehicleType, nickname, make, model, year, 
        color, engineSizeCC, startingOdometer, licensePlate, 
        registrationExpiry, hasSyncedManual, maintenanceMatrixJson, is_synced, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        offlineId, DEV_USER_ID, vehicle.vehicleType || 'Car', vehicle.nickname || '',
        vehicle.make || '', vehicle.model || '', safeYear, vehicle.color || '',
        safeEngineSize, safeOdometer, vehicle.licensePlate || '', safeExpiry,
        vehicle.hasSyncedManual ? 1 : 0,
        vehicle.maintenanceMatrixJson || null,
        now
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
    const now = new Date().toISOString();

    const safeYear = Number(vehicle.year) || new Date().getFullYear();
    const safeEngineSize = Number(vehicle.engineSizeCC) || 0;
    const safeOdometer = Number(vehicle.startingOdometer) || 0;
    const safeExpiry = vehicle.registrationExpiry ? String(vehicle.registrationExpiry) : '';

    await db.runAsync(
      `UPDATE Vehicles SET 
        vehicleType = ?, nickname = ?, make = ?, model = ?, year = ?, 
        color = ?, engineSizeCC = ?, startingOdometer = ?, licensePlate = ?, 
        registrationExpiry = ?, maintenanceMatrixJson = ?, is_synced = 0, updatedAt = ?
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
        vehicle.maintenanceMatrixJson || null,
        now,
        vehicle.id!
      ]
    );
  },

  async getVehicleStats(vehicleId: number) {
    const db = await getDb();

    const vehicle = await db.getFirstAsync<{ startingOdometer: number }>(
      `SELECT startingOdometer FROM Vehicles WHERE id = ?`, [vehicleId]
    );
    const startingOdo = vehicle?.startingOdometer || 0;

    const fuelStats = await db.getFirstAsync<{ totalFuelCost: number, maxOdo: number, minOdo: number, totalVol: number }>(
      `SELECT 
        SUM(totalCost) as totalFuelCost, 
        MAX(odometer) as maxOdo, 
        MIN(odometer) as minOdo, 
        SUM(volume) as totalVol 
       FROM RefuelLogs WHERE vehicleId = ?`,
      [vehicleId]
    );

    const maintStats = await db.getFirstAsync<{ totalMaintCost: number, maxOdo: number }>(
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
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO RefuelLogs (
        id, vehicleId, date, odometer, volume, totalCost, fuelType, is_synced, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        offlineId,
        log.vehicleId!,
        log.date,
        log.odometer,
        log.volume,
        log.totalCost,
        log.fuelType || 'Unleaded',
        now
      ]
    );

    return offlineId;
  },

  async getFuelLogById(id: number) {
    const db = await getDb();
    return await db.getFirstAsync<RefuelLog>(`SELECT * FROM RefuelLogs WHERE id = ?`, [id]);
  },

  async updateFuelLog(log: RefuelLog) {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE RefuelLogs SET 
        date = ?, odometer = ?, volume = ?, totalCost = ?, fuelType = ?, is_synced = 0, updatedAt = ? 
       WHERE id = ?`,
      [
        log.date,
        log.odometer,
        log.volume,
        log.totalCost,
        log.fuelType || 'Unleaded',
        now,
        log.id!
      ]
    );
  },

  async deleteFuelLog(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM RefuelLogs WHERE id = ?`, [id]);
  },

  async addMaintenanceLog(log: Omit<MaintenanceLog, 'id' | 'is_synced'>) {
    const db = await getDb();
    const offlineId = generateOfflineId();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO MaintenanceLogs (
        id, vehicleId, logType, serviceCategory, date, odometer, 
        serviceType, price, isDIY, shopName, mechanicName, 
        contactNumber, notes, nextServiceOdometer, nextServiceDate, 
        tirePosition, is_synced, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        offlineId,
        log.vehicleId!,
        log.logType,
        log.serviceCategory || null,
        log.date,
        log.odometer,
        log.serviceType,
        log.price,
        log.isDIY ? 1 : 0,
        log.shopName || null,
        log.mechanicName || null,
        log.contactNumber || null,
        log.notes || null,
        log.nextServiceOdometer || null,
        log.nextServiceDate || null,
        log.tirePosition || null,
        now
      ]
    );

    return offlineId;
  },

  async getMaintenanceLogById(id: number) {
    const db = await getDb();
    return await db.getFirstAsync<MaintenanceLog>(`SELECT * FROM MaintenanceLogs WHERE id = ?`, [id]);
  },

  async updateMaintenanceLog(log: MaintenanceLog) {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE MaintenanceLogs SET 
        logType = ?, serviceCategory = ?, date = ?, odometer = ?, 
        serviceType = ?, price = ?, isDIY = ?, shopName = ?, mechanicName = ?, 
        contactNumber = ?, notes = ?, nextServiceOdometer = ?, nextServiceDate = ?, 
        tirePosition = ?, is_synced = 0, updatedAt = ? 
       WHERE id = ?`,
      [
        log.logType,
        log.serviceCategory || null,
        log.date,
        log.odometer,
        log.serviceType,
        log.price,
        log.isDIY ? 1 : 0,
        log.shopName || null,
        log.mechanicName || null,
        log.contactNumber || null,
        log.notes || null,
        log.nextServiceOdometer || null,
        log.nextServiceDate || null,
        log.tirePosition || null,
        now,
        log.id!
      ]
    );
  },

  async deleteMaintenanceLog(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM MaintenanceLogs WHERE id = ?`, [id]);
  }

};

const SETTINGS_KEYS = {
  DISTANCE: '@NaviMonitor:distanceUnit',
  VOLUME: '@NaviMonitor:volumeUnit',
  FUEL_TYPES: '@NaviMonitor:fuelTypes'
};

export const SettingsRepository = {
  async getSettings() {
    try {
      const distance = await AsyncStorage.getItem(SETTINGS_KEYS.DISTANCE);
      const volume = await AsyncStorage.getItem(SETTINGS_KEYS.VOLUME);
      const fuelData = await AsyncStorage.getItem(SETTINGS_KEYS.FUEL_TYPES);

      return {
        distanceUnit: (distance as 'KM' | 'MI') || 'KM',
        volumeUnit: (volume as 'L' | 'GAL') || 'L',
        fuelTypes: fuelData ? JSON.parse(fuelData) : ['UNLEADED', 'PREMIUM', 'DIESEL']
      };
    } catch (e) {
      console.error("Failed to load settings", e);
      return { distanceUnit: 'KM', volumeUnit: 'L', fuelTypes: ['UNLEADED', 'PREMIUM', 'DIESEL'] };
    }
  },

  async saveDistanceUnit(unit: 'KM' | 'MI') {
    await AsyncStorage.setItem(SETTINGS_KEYS.DISTANCE, unit);
  },

  async saveVolumeUnit(unit: 'L' | 'GAL') {
    await AsyncStorage.setItem(SETTINGS_KEYS.VOLUME, unit);
  },

  async saveFuelTypes(types: string[]) {
    await AsyncStorage.setItem(SETTINGS_KEYS.FUEL_TYPES, JSON.stringify(types));
  }
};
