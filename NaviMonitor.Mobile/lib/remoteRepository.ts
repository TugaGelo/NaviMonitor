import { apiClient } from './apiClient';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../types';

export const RemoteRepository = {
  async syncVehicle(vehicle: Vehicle) {
    if (vehicle.serverId) {
      return (await apiClient.put(`/vehicle/${vehicle.serverId}`, vehicle)).data;
    } else {
      return (await apiClient.post('/vehicle', vehicle)).data;
    }
  },

  async syncFuelLog(log: RefuelLog) {
    if (log.serverId) {
      return (await apiClient.put(`/refuel/${log.serverId}`, log)).data;
    } else {
      return (await apiClient.post('/refuel', log)).data;
    }
  },

  async syncMaintenanceLog(log: MaintenanceLog) {
    if (log.serverId) {
      return (await apiClient.put(`/maintenance/${log.serverId}`, log)).data;
    } else {
      return (await apiClient.post('/maintenance', log)).data;
    }
  }
};
