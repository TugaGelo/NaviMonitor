export interface MaintenanceMatrixItem {
  item: string;
  interval: number;
  action: string;
  initial?: number;
}

export interface Vehicle {
  id: number;
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
}

export interface RefuelLog {
  id?: number;
  vehicleId: number;
  date: string;
  odometer: number;
  volume: number;
  totalCost: number;
  fuelType?: string;
}

export interface MaintenanceLog {
  id?: number;
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
}
