import { Filter, Zap, DollarSign, Wrench } from 'lucide-react';
import StatCard from '../../ui/display/StatCard';

interface MetricGridProps {
  avgEfficiency: string;
  costPerKm: string;
  totalSpent: number;
  nextServiceDistance: number | string;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
}

export default function MetricGrid({
  avgEfficiency,
  costPerKm,
  totalSpent,
  nextServiceDistance,
  timeFilter,
  setTimeFilter
}: MetricGridProps) {
  
  const FilterDropdown = (
    <div className="flex items-center text-zinc-400 hover:text-black transition-colors cursor-pointer group">
      <Filter className="w-3 h-3 mr-1" />
      <select 
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        className="text-[10px] font-black bg-transparent outline-none cursor-pointer appearance-none text-inherit uppercase tracking-widest group-hover:text-black"
      >
        <option value="All Time">All Time</option>
        <option value="6 Months">6 Months</option>
      </select>
    </div>
  );

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard 
        label="Avg Efficiency" 
        value={avgEfficiency} 
        suffix="km/L" 
        icon={Zap}
      />
      <StatCard 
        label="Ownership Cost" 
        value={costPerKm} 
        prefix="₱" 
        suffix="/ km" 
        icon={DollarSign}
      />
      <StatCard 
        label="Total Spent" 
        value={totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        prefix="₱" 
        action={FilterDropdown}
      />
      <StatCard 
        label="Next Service In" 
        value={nextServiceDistance.toLocaleString()} 
        suffix="km" 
        icon={Wrench}
        color="secondary"
        trend={{ value: "Estimated threshold", isUp: false }}
      />
    </section>
  );
}
