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
  notes?: string;
}

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    vehicleType: 'CAR',
    nickname: 'COCO',
    make: 'Honda',
    model: 'Navi',
    year: 2026,
    color: 'Black/White',
    engineSizeCC: 109,
    startingOdometer: 0,
    licensePlate: 'P36-22V',
    registrationExpiry: 'May 4, 2026',
    maintenanceMatrixJson: JSON.stringify([
      { item: 'Engine Oil', interval: 4000, action: 'Replace', initial: 1000 },
      { item: 'Air Filter', interval: 12000, action: 'Replace' }
    ])
  },
  {
    id: 2,
    vehicleType: 'BIKE',
    nickname: 'THUNDER',
    make: 'Honda',
    model: 'Navi',
    year: 2021,
    color: 'Red',
    engineSizeCC: 109,
    startingOdometer: 0,
    licensePlate: 'B894-GE',
    maintenanceMatrixJson: JSON.stringify([
      { item: 'Engine Oil', interval: 4000, action: 'Replace', initial: 1000 },
      { item: 'Fuel Line', interval: 4000, action: 'Inspect', initial: 1000 },
      { item: 'Spark Plug', interval: 8000, action: 'Replace' }
    ])
  }
];

export const MOCK_LOGS: MaintenanceLog[] = [
  {
    id: 1,
    vehicleId: 2,
    logType: 'Maintenance',
    date: '2025-05-01',
    odometer: 1000,
    serviceType: 'Engine Oil',
    price: 850,
    isDIY: true,
  },
  {
    id: 2,
    vehicleId: 2,
    logType: 'Maintenance',
    date: '2025-05-01',
    odometer: 1000,
    serviceType: 'Fuel Line',
    price: 0,
    isDIY: true,
  }
];
