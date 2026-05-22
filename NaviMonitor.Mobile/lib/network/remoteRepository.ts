import { apiClient } from '../network/apiClient';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../../types';

export const RemoteRepository = {
  async syncVehicle(vehicle: Vehicle) {
    if (vehicle.serverId && Number(vehicle.serverId) > 0) {
      const payload = { ...vehicle, id: Number(vehicle.serverId) };
      return (await apiClient.put(`/vehicle/${vehicle.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('/vehicle', vehicle)).data;
    }
  },

  async syncFuelLog(log: RefuelLog) {
    if (log.serverId && Number(log.serverId) > 0) {
      const payload = { ...log, id: Number(log.serverId) };
      return (await apiClient.put(`/refuel/${log.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('/refuel', log)).data;
    }
  },

  async syncMaintenanceLog(log: MaintenanceLog) {
    if (log.serverId && Number(log.serverId) > 0) {
      const payload = { ...log, id: Number(log.serverId) };
      return (await apiClient.put(`/maintenance/${log.serverId}`, payload)).data;
    } else {
      return (await apiClient.post('/maintenance', log)).data;
    }
  }
};
