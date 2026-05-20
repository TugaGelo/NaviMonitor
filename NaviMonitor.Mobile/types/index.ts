export interface MaintenanceMatrixItem {
  item: string;
  interval: number;
  action: string;
  initial?: number;
}

export interface Vehicle {
  id: number;
  serverId?: number;
  userId: string;
  vehicleType: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineSizeCC: number;
  startingOdometer: number;
  licensePlate: string;
  registrationExpiry?: string;
  hasSyncedManual?: boolean;
  maintenanceMatrixJson?: string;
  is_synced?: number;
  updatedAt?: string;
}

export interface RefuelLog {
  id?: number;
  serverId?: number;
  vehicleId: number;
  date: string;
  odometer: number;
  volume: number;
  totalCost: number;
  fuelType?: string;
  is_synced?: number;
  updatedAt?: string;
}

export interface MaintenanceLog {
  id?: number;
  serverId?: number;
  vehicleId: number;
  logType: 'Maintenance' | 'Modification';
  serviceCategory?: string;
  date: string;
  odometer: number;
  serviceType: string;
  price: number;
  isDIY: boolean;
  shopName?: string;
  mechanicName?: string;
  contactNumber?: string;
  notes?: string;
  nextServiceOdometer?: number;
  nextServiceDate?: string;
  tirePosition?: string;
  is_synced?: number;
  updatedAt?: string;
}
