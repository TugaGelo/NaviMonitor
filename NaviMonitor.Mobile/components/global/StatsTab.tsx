import { View, Text, DimensionValue } from 'react-native';
import { useState, useEffect } from 'react';
import { PieChart, BarChart3, Wallet, Gauge } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { Vehicle } from '../../types';
import StatCard from '../vehicle/StatCard';
import { SettingsRepository } from '../../lib/database/localRepository';

interface StatsTabProps {
  vehicles: Vehicle[];
  timeline: any[];
}

export default function StatsTab({ vehicles, timeline }: StatsTabProps) {
  const [effUnit, setEffUnit] = useState('KM/L');

  useEffect(() => {
    SettingsRepository.getSettings().then(s => {
      setEffUnit(`${s.distanceUnit}/${s.volumeUnit}`);
    });
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth(); 
  const currentYear = now.getFullYear(); 

  let totalMonthlySpend = 0;
  let totalFuelCost = 0;
  let totalServiceCost = 0;
  const weeklyTrends = [0, 0, 0, 0];

  timeline.forEach((log) => {
    const logDate = new Date(log.date);
    const logYear = logDate.getFullYear();
    const logMonth = logDate.getMonth();
    const cost = log.totalCost || log.price || 0;

    if (log.feedType === 'Refuel') totalFuelCost += cost;
    if (log.feedType === 'Maintenance' || log.feedType === 'Modification') totalServiceCost += cost;

    if (logYear === currentYear && logMonth === currentMonth) {
      totalMonthlySpend += cost;
      const day = logDate.getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      weeklyTrends[weekIndex] += cost;
    }
  });

  const vehiclesWithEff = vehicles.filter(v => v.id); 
  const avgEfficiency = vehiclesWithEff.length > 0 ? "12.4" : "0.0"; 

  const overallGarageSpend = totalFuelCost + totalServiceCost;
  const fuelPercentage = overallGarageSpend > 0 ? Math.round((totalFuelCost / overallGarageSpend) * 100) : 0;

  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; 
  const fillPercentage = fuelPercentage === 0 && overallGarageSpend === 0 ? 0 : fuelPercentage;
  const fuelDashoffset = circumference - (fillPercentage / 100) * circumference;

  const maxWeeklySpend = Math.max(...weeklyTrends, 1);
  const getBarHeightPercent = (amount: number): DimensionValue => {
    if (amount === 0) return "4%"; 
    return `${Math.max(Math.round((amount / maxWeeklySpend) * 100), 8)}%`;
  };

  return (
    <View className="flex-1 px-6 pt-2 pb-32">
      <View className="flex-row justify-between w-full mb-4">
        <StatCard label="Total Spend" value={totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} prefix="₱" icon={Wallet} />
        <StatCard label="Efficiency" value={avgEfficiency} unit={effUnit} icon={Gauge} />
      </View>

      <View className="bg-[#ffffff] border border-[#e5e2e1] rounded-2xl p-5 shadow-sm h-40 mb-4 justify-between">
        <View className="flex-row items-center gap-2">
          <PieChart size={16} color="#848484" />
          <Text className="font-bold text-[10px] text-[#1c1b1b] uppercase tracking-widest">Spend Ratio (Fuel vs Service)</Text>
        </View>

        <View className="flex-row items-center justify-between px-2">
          <View className="relative items-center justify-center w-[80px] h-[80px]">
            <Svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <Circle cx="50" cy="50" r={radius} stroke="#1c1b1b" strokeWidth={strokeWidth} fill="transparent" />
              <Circle cx="50" cy="50" r={radius} stroke="#b7102a" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={fuelDashoffset} strokeLinecap="butt" />
            </Svg>
            <View className="absolute items-center justify-center">
              <Text className="font-extrabold text-[15px] text-[#1c1b1b] tracking-tighter leading-none">{overallGarageSpend > 0 ? `${fuelPercentage}%` : '0%'}</Text>
            </View>
          </View>
          <View className="justify-center gap-2 pr-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-[#b7102a]" />
              <View>
                <Text className="font-bold text-[9px] text-[#848484] uppercase tracking-widest leading-none">Fuel</Text>
                <Text className="font-bold text-xs text-[#1c1b1b] mt-0.5 leading-none">₱ {totalFuelCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-[#1c1b1b]" />
              <View>
                <Text className="font-bold text-[9px] text-[#848484] uppercase tracking-widest leading-none">Service</Text>
                <Text className="font-bold text-xs text-[#1c1b1b] mt-0.5 leading-none">₱ {totalServiceCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-[#ffffff] border border-[#e5e2e1] rounded-2xl p-5 shadow-sm flex-1">
        <View className="flex-row items-center gap-2 mb-4">
          <BarChart3 size={16} color="#848484" />
          <Text className="font-bold text-[10px] text-[#1c1b1b] uppercase tracking-widest">4-Week Expense Trend</Text>
        </View>
        <View className="flex-1 flex-row items-end justify-between px-4 pt-2 relative">
          <View className="absolute bottom-4 left-0 right-0 border-t border-[#e5e2e1] opacity-50 z-0" />
          <View className="items-center w-[15%] z-10"><View style={{ height: getBarHeightPercent(weeklyTrends[0]) }} className="w-full bg-[#e5e2e1] rounded-t-sm" /><Text className="font-bold text-[9px] text-[#848484] mt-2 uppercase">W1</Text></View>
          <View className="items-center w-[15%] z-10"><View style={{ height: getBarHeightPercent(weeklyTrends[1]) }} className="w-full bg-[#e5e2e1] rounded-t-sm" /><Text className="font-bold text-[9px] text-[#848484] mt-2 uppercase">W2</Text></View>
          <View className="items-center w-[15%] z-10"><View style={{ height: getBarHeightPercent(weeklyTrends[2]) }} className="w-full bg-[#e5e2e1] rounded-t-sm" /><Text className="font-bold text-[9px] text-[#848484] mt-2 uppercase">W3</Text></View>
          <View className="items-center w-[15%] z-10"><View style={{ height: getBarHeightPercent(weeklyTrends[3]) }} className="w-full bg-[#b7102a] rounded-t-sm shadow-sm" /><Text className="font-bold text-[9px] text-[#b7102a] mt-2 uppercase">W4</Text></View>
        </View>
      </View>
    </View>
  );
}
