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
    notes: 'Fully Synthetic'
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
    notes: 'Inspected, looks good'
  },
  {
    id: 3,
    vehicleId: 2,
    logType: 'Maintenance',
    date: '2025-08-15',
    odometer: 2500,
    serviceType: 'Brake Fluid Flush',
    price: 1200,
    isDIY: false,
    notes: 'Motul DOT 4 - Done at JT Mechanics'
  },
  {
    id: 4,
    vehicleId: 2,
    logType: 'Maintenance',
    date: '2025-11-02',
    odometer: 3100,
    serviceType: 'Spark Plug',
    price: 350,
    isDIY: true,
    notes: 'NGK Iridium'
  },
  {
    id: 5,
    vehicleId: 2,
    logType: 'Maintenance',
    date: '2026-02-10',
    odometer: 3450,
    serviceType: 'Rear Tire Replacement',
    price: 4500,
    isDIY: false,
    notes: 'Pirelli Diablo Rosso Sport'
  },

  {
    id: 6,
    vehicleId: 1,
    logType: 'Maintenance',
    date: '2026-06-01',
    odometer: 1000,
    serviceType: 'Engine Oil',
    price: 900,
    isDIY: false,
    notes: 'Dealer Break-in Service'
  }
];
