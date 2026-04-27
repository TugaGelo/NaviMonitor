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
