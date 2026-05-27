import { apiClient } from '../network/apiClient';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../../types';

export const RemoteRepository = {
  async syncVehicle(vehicle: Vehicle) {
    if (vehicle.serverId && Number(vehicle.serverId) > 0) {
      const payload = { ...vehicle, id: Number(vehicle.serverId) };
      return (await apiClient.put(`Vehicle/${vehicle.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('Vehicle', vehicle)).data;
    }
  },

  async deleteVehicle(serverId: number) {
    return (await apiClient.delete(`Vehicle/${serverId}`)).data;
  },

  async syncFuelLog(log: RefuelLog) {
    if (log.serverId && Number(log.serverId) > 0) {
      const payload = { ...log, id: Number(log.serverId) };
      return (await apiClient.put(`Refuel/${log.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('Refuel', log)).data;
    }
  },

  async deleteFuelLog(serverId: number) {
    return (await apiClient.delete(`Refuel/${serverId}`)).data;
  },

  async syncMaintenanceLog(log: MaintenanceLog) {
    if (log.serverId && Number(log.serverId) > 0) {
      const payload = { ...log, id: Number(log.serverId) };
      return (await apiClient.put(`Maintenance/${log.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('Maintenance', log)).data;
    }
  },

  async deleteMaintenanceLog(serverId: number) {
    return (await apiClient.delete(`Maintenance/${serverId}`)).data;
  }
};
