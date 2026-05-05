export interface Vehicle {
  id: string;
  nickname: string;
  model: string;
  year: string;
  odo: string;
  type: 'CAR' | 'BIKE';
  ltoReg: string;
  lastRefuel: string;
  stats: {
    avgEfficiency: string;
    costPerKm: string;
    totalSpent: string;
    nextService: string;
  };
}

export const VEHICLES: Vehicle[] = [
  {
    id: '1',
    nickname: 'COCO',
    model: 'Honda Navi',
    year: '2026',
    odo: '200',
    type: 'CAR',
    ltoReg: 'May 4, 2026',
    lastRefuel: 'May 4',
    stats: {
      avgEfficiency: '0.0',
      costPerKm: '0.00',
      totalSpent: '200',
      nextService: '2,800',
    }
  },
  {
    id: '2',
    nickname: 'THUNDER',
    model: 'Honda Navi',
    year: '2023',
    odo: '3,500',
    type: 'BIKE',
    ltoReg: 'Oct 12, 2026',
    lastRefuel: 'Apr 28',
    stats: {
      avgEfficiency: '45.2',
      costPerKm: '2.80',
      totalSpent: '12,500',
      nextService: '500',
    }
  }
];
