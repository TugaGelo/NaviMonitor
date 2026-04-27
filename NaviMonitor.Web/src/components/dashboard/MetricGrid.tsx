import { Filter } from 'lucide-react';

interface MetricGridProps {
  avgEfficiency: string;
  costPerKm: string;
  totalSpent: number;
  currentOdometer: number;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
}

export default function MetricGrid({
  avgEfficiency,
  costPerKm,
  totalSpent,
  currentOdometer,
  timeFilter,
  setTimeFilter
}: MetricGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
        <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Avg Efficiency</span>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black text-black">{avgEfficiency} <span className="text-lg text-zinc-400 font-medium">km/L</span></span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
        <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Overall Cost Per KM</span>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black text-black">
            <span className="text-xl mr-1">₱</span>{costPerKm}
          </span>
          <span className="text-zinc-400 text-sm font-medium mb-1">/ km</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between group">
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Total Spent</span>
          <div className="flex items-center text-zinc-400 hover:text-black transition-colors cursor-pointer">
            <Filter className="w-3 h-3 mr-1" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-bold bg-transparent outline-none cursor-pointer appearance-none text-inherit"
            >
              <option value="All Time">All Time</option>
              <option value="6 Months">6 Months</option>
            </select>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black text-black">₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
        <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Current Odometer</span>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black text-black">
            {currentOdometer.toLocaleString()}
          </span>
          <span className="text-zinc-400 text-sm font-medium mb-1">km</span>
        </div>
      </div>
    </section>
  );
}
