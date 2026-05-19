import { View, Text, Pressable, SectionList, ScrollView } from 'react-native';
import { useState, useMemo, memo } from 'react';
import { Inbox } from 'lucide-react-native';
import { calculateTabStats } from '../../lib/statsEngine';
import TimelineItem from './TimelineItem';
import StatCard from './StatCard';

const FILTER_TABS = ['All', 'Fuel', 'Service', 'Mods'];

export const LogsTab = memo(({ vehicle, rawLogs, onLogPress }: any) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const { sections, stats } = useMemo(() => {
    let filtered = rawLogs;
    if (activeFilter === 'Fuel') filtered = rawLogs.filter((l:any) => l.feedType === 'Refuel');
    if (activeFilter === 'Service') filtered = rawLogs.filter((l:any) => l.feedType === 'Maintenance');
    if (activeFilter === 'Mods') filtered = rawLogs.filter((l:any) => l.feedType === 'Modification');

    const groups = filtered.reduce((acc:any, log:any) => {
      const d = new Date(log.date);
      const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(log);
      return acc;
    }, {});

    const sectioned = Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
    const calculatedStats = calculateTabStats(activeFilter, filtered, vehicle);
    
    return { sections: sectioned, stats: calculatedStats };
  }, [rawLogs, activeFilter, vehicle]);

  return (
    <View className="flex-1 bg-[#fcf9f8]">
      {/* Header */}
      <View className="px-6 pt-2 pb-6 bg-[#fcf9f8] z-50">
        <Text className="text-[40px] leading-none font-black tracking-tight text-[#1c1b1b] uppercase">Archive</Text>
        <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.2em] mt-2">
          {vehicle?.nickname || 'VEHICLE'} • {rawLogs.length} RECORDS
        </Text>
      </View>

      {/* Filter Row */}
      <View className="px-6 pb-8 bg-[#fcf9f8] z-50 border-[#e5e2e1]">
        <View className="flex-row gap-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <Pressable 
                  key={tab} 
                  onPress={() => setActiveFilter(tab)} 
                  className={`px-6 py-3 rounded-full border ${isActive ? 'bg-[#1b1b1b] border-[#1b1b1b]' : 'bg-[#fcf9f8] border-[#e5e2e1] active:bg-[#f0eded]'}`}
                >
                  <Text className={`text-[13px] font-bold tracking-wide ${isActive ? 'text-white' : 'text-[#4c4546]'}`}>{tab}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Timeline List */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index, section }) => (
          <View>
            <TimelineItem 
              item={item} 
              isLast={index === section.data.length - 1} 
              onPress={() => onLogPress(item)} 
              className="px-6"
            />
          </View>
        )}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => (
          <View className="px-6 mb-8 mt-2">
            {stats ? (
              <>
                <View className="flex-row justify-between mb-3">
                  <StatCard 
                    label={stats.topL.label} 
                    value={stats.topL.val} 
                    icon={stats.topL.icon} 
                  />
                  <StatCard 
                    label={stats.topR.label} 
                    value={stats.topR.val} 
                    icon={stats.topR.icon} 
                  />
                </View>
                <StatCard 
                  label={stats.anchor.label} 
                  value={stats.anchor.val} 
                  subtext={stats.anchor.sub} 
                  fullWidth 
                />
              </>
            ) : (
               <View className="w-full bg-[#f6f3f2] border border-[#e5e2e1] rounded-2xl p-5 items-center justify-center h-[120px]">
                  <Text className="text-[12px] font-bold text-[#848484] uppercase tracking-widest">Not enough data to calculate stats</Text>
               </View>
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-[#fcf9f8] pt-4 pb-6 px-6">
            <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[2px]">{title}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center pt-10">
            <Inbox size={40} color="#dcd9d9" />
            <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest mt-4 text-center">No records found</Text>
          </View>
        )}
      />
    </View>
  );
});

export default LogsTab;
