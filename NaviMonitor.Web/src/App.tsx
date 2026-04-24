import { useState } from 'react';
import { Plus, Gauge, CalendarDays, ChevronRight, Settings2, ShieldAlert } from 'lucide-react';

// 1. Defining the shape of our data (Matching your C# Backend)
interface Vehicle {
  id: number;
  vehicleType: 'Motorcycle' | 'Car';
  nickname: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineSizeCC: number;
  odometer: number;
  licensePlate: string;
  registrationExpiry?: string;
}

// 2. Mock Data (Until we connect Axios to your C# API)
const mockVehicles: Vehicle[] = [
  {
    id: 1,
    vehicleType: 'Motorcycle',
    nickname: 'The Panda',
    make: 'Honda',
    model: 'Navi',
    year: 2023,
    color: 'Nut Brown',
    engineSizeCC: 109,
    odometer: 4250,
    licensePlate: '123-ABC',
    registrationExpiry: '2026-10-15',
  },
  {
    id: 2,
    vehicleType: 'Car',
    nickname: 'Daily Driver',
    make: 'Toyota',
    model: 'Vios',
    year: 2025,
    color: 'Silver',
    engineSizeCC: 1500,
    odometer: 15000,
    licensePlate: 'XYZ-987',
    registrationExpiry: '2026-05-10', // Expiring soon for UI testing
  }
];

export default function App() {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      
      {/* HEADER - The "Noir" Primary */}
      <header className="bg-primary text-surface px-6 py-5 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Settings2 className="text-secondary w-6 h-6" />
          <h1 className="font-bold tracking-wide text-xl">NaviMonitor</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral flex items-center justify-center border border-zinc-700">
          <span className="text-sm font-bold">G</span>
        </div>
      </header>

      {/* MAIN CONTENT - The Garage */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-6">
        
        {/* Page Title & Main Action */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">My Garage</h2>
            <p className="text-zinc-500 font-medium mt-1">Select a vehicle to view dashboard</p>
          </div>
          <button className="bg-secondary text-surface px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors active:scale-95">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Vehicle</span>
          </button>
        </div>

        {/* VEHICLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => {
            
            // Logic to check if registration is expiring soon (within 30 days)
            const isExpiringSoon = vehicle.registrationExpiry && 
              (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

            return (
              <div key={vehicle.id} className="card-noir group cursor-pointer border border-zinc-200/60 relative overflow-hidden">
                
                {/* Accent Line at top of card */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-secondary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Card Header: Identity */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary leading-none mb-2">{vehicle.nickname}</h3>
                    <p className="text-zinc-500 font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.color}
                    </p>
                  </div>
                  <span className="bg-zinc-100 text-neutral text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {vehicle.vehicleType}
                  </span>
                </div>

                {/* Card Body: Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Gauge className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Odometer</span>
                    </div>
                    <p className="font-bold text-lg text-primary">{vehicle.odometer.toLocaleString()} <span className="text-xs text-zinc-400 font-medium">km</span></p>
                  </div>

                  <div className={`rounded-xl p-3 border ${isExpiringSoon ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isExpiringSoon ? 'text-secondary' : 'text-zinc-500'}`}>
                      {isExpiringSoon ? <ShieldAlert className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                      <span className="text-xs font-semibold uppercase tracking-wider">LTO Reg</span>
                    </div>
                    <p className={`font-bold text-sm ${isExpiringSoon ? 'text-secondary' : 'text-primary'}`}>
                      {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Action */}
                <div className="flex justify-between items-center border-t border-zinc-100 pt-4 mt-2">
                  <span className="text-sm font-bold text-zinc-400 font-mono tracking-widest">{vehicle.licensePlate}</span>
                  <div className="flex items-center text-secondary font-bold text-sm group-hover:translate-x-1 transition-transform">
                    View Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
