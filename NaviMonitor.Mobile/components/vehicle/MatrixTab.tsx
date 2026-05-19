import { View, Text, ScrollView, Pressable } from 'react-native';
import { useMemo, memo } from 'react';
import { Shield, ShieldAlert, AlertTriangle, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import PageHeader from './PageHeader';

export const MatrixTab = memo(({ vehicle, stats, timeline }: any) => {
  const router = useRouter();

  const handleAISync = () => {
    router.push({
      pathname: '/vehicle/matrix/sync',
      params: { vehicleId: vehicle.id }
    });
  };
  
  const matrixData = useMemo(() => {
    if (!vehicle?.maintenanceMatrixJson) return [];
    
    try {
      const parsedMatrix = JSON.parse(vehicle.maintenanceMatrixJson);
      
      return parsedMatrix.map((matrixItem: any) => {
        const serviceLogs = timeline.filter((l: any) => 
          l.feedType === 'Maintenance' && l.serviceType === matrixItem.item
        );
        const latestLog = serviceLogs.length > 0 ? serviceLogs[0] : null;
        
        const lastServiceOdo = latestLog ? latestLog.odometer : vehicle.startingOdometer;
        const distanceTraveled = Math.max(0, stats.currentOdo - lastServiceOdo);
        const remainingKm = matrixItem.interval - distanceTraveled;
        
        const progressPct = Math.min(100, Math.max(0, (distanceTraveled / matrixItem.interval) * 100));

        let status = 'OK';
        if (remainingKm < 0) status = 'OVERDUE';
        else if (remainingKm <= matrixItem.interval * 0.15) status = 'WARNING';

        return {
          ...matrixItem,
          lastServiceOdo,
          distanceTraveled,
          remainingKm,
          progressPct,
          status
        };
      }).sort((a: any, b: any) => a.remainingKm - b.remainingKm);
      
    } catch (e) {
      console.error("Failed to parse Matrix JSON", e);
      return [];
    }
  }, [vehicle, timeline, stats]);

  const { generalHealth, criticalItem, attentionCount } = useMemo(() => {
    if (matrixData.length === 0) return { generalHealth: 100, criticalItem: null, attentionCount: 0 };
    
    const totalProgress = matrixData.reduce((acc: number, curr: any) => acc + curr.progressPct, 0);
    const avgProgress = totalProgress / matrixData.length;
    
    const health = Math.max(0, Math.round(100 - avgProgress));
    
    const critical = matrixData[0];
    
    const attention = matrixData.filter((m: any) => m.status === 'OVERDUE' || m.status === 'WARNING').length;
    
    return { generalHealth: health, criticalItem: critical, attentionCount: attention };
  }, [matrixData]);

  if (matrixData.length === 0) {
    return (
      <View className="flex-1 bg-[#fcf9f8] px-6 pt-4">
        <PageHeader title="MATRIX" subtitle={`${vehicle?.nickname} • NO TRACKING DATA`} rightIcon={Shield} />
        <View className="flex-1 items-center justify-center pb-20">
          <AlertTriangle size={48} color="#dcd9d9" className="mb-4" />
          <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest text-center">
            No Maintenance Matrix Configured
          </Text>
          
          <Pressable 
            onPress={handleAISync}
            className="mt-8 bg-[#1c1b1b] flex-row items-center justify-center px-6 py-4 rounded-xl active:scale-95 transition-transform shadow-md shadow-black/20"
          >
            <Sparkles size={20} color="#ffffff" className="mr-3" />
            <Text className="text-white font-black text-[14px] uppercase tracking-widest">
              AI Sync Manual
            </Text>
          </Pressable>

        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 pt-4 bg-[#fcf9f8]" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      
      {/* Unified Typography Header */}
      <View className="mb-4 z-50">
        <PageHeader 
          title="MATRIX" 
          subtitle={
            <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
              {attentionCount > 0 && <AlertTriangle size={12} color="#848484" strokeWidth={2.5} />}
              <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">
                {vehicle?.nickname} • {attentionCount === 0 ? 'SYSTEMS NOMINAL' : `${attentionCount} ITEMS REQUIRE ATTENTION`}
              </Text>
            </View>
          }
          rightIcon={attentionCount > 0 ? ShieldAlert : Shield}
        />
      </View>

      {/* Global Diagnostics Card */}
      <View className="bg-white border border-[#e5e2e1] rounded-2xl p-5 mb-8 shadow-sm shadow-black/5">
        <View className="flex-row justify-between items-end mb-3">
          <Text className="font-bold text-[14px] text-[#848484] uppercase tracking-wider">General Health</Text>
          <Text className="font-black text-[32px] text-[#1c1b1b] leading-none">{generalHealth}%</Text>
        </View>
        
        {/* Sleek Progress Bar */}
        <View className="h-1.5 w-full bg-[#f0eded] rounded-full overflow-hidden mb-4">
          <View 
            className={`h-full rounded-full ${generalHealth < 40 ? 'bg-[#b7102a]' : 'bg-[#1c1b1b]'}`} 
            style={{ width: `${generalHealth}%` }} 
          />
        </View>
        
        <View className="border-t border-[#f0eded] pt-3">
          <Text className="font-bold text-[11px] text-[#848484] uppercase tracking-wider">
            Next critical milestone: {criticalItem?.item} in {Math.max(0, criticalItem?.remainingKm).toLocaleString()} km
          </Text>
        </View>
      </View>

      {/* Component Matrix List */}
      <View className="flex-col">
        <Text className="text-[11px] font-black text-[#848484] uppercase tracking-widest mb-4 pl-1">Component Matrix</Text>
        
        <View className="flex-col gap-3">
          {matrixData.map((item: any, idx: number) => {
            const isOverdue = item.status === 'OVERDUE';
            const isWarning = item.status === 'WARNING';
            
            const cardBg = isOverdue ? 'bg-[#b7102a]/10 border-[#b7102a]/30' : 'bg-white border-[#e5e2e1] shadow-sm shadow-black/5';
            const textMain = isOverdue ? 'text-[#b7102a]' : 'text-[#1c1b1b]';
            const textSub = isOverdue ? 'text-[#b7102a]/70' : 'text-[#848484]';
            const barBg = isOverdue ? 'bg-[#b7102a]/20' : 'bg-[#f0eded]';
            const barFill = isOverdue ? 'bg-[#b7102a]' : (isWarning ? 'bg-[#1c1b1b]' : 'bg-[#1c1b1b]/70');

            return (
              <Pressable 
                key={`${item.item}-${idx}`}
                className={`rounded-xl p-4 flex-col border active:opacity-60 transition-opacity ${cardBg}`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-col">
                    <Text className={`font-black text-[14px] uppercase tracking-wide ${textMain}`}>
                      {item.item}
                    </Text>
                    <Text className={`font-bold text-[11px] uppercase tracking-wider mt-1 ${textSub}`}>
                      Every {item.interval.toLocaleString()} km
                    </Text>
                  </View>
                  <Text className={`font-black text-[12px] uppercase tracking-widest ${textMain}`}>
                    {isOverdue 
                      ? `${item.remainingKm.toLocaleString()} KM OVERDUE` 
                      : `${item.remainingKm.toLocaleString()} KM LEFT`}
                  </Text>
                </View>
                
                {/* Micro Lifespan Indicator */}
                <View className={`h-[3px] w-full rounded-full overflow-hidden ${barBg}`}>
                  <View className={`h-full rounded-full ${barFill}`} style={{ width: `${item.progressPct}%` }} />
                </View>
              </Pressable>
            );
          })}

          {/* Re-Sync Button for Populated State */}
          <Pressable 
            onPress={handleAISync} 
            className="mt-2 py-4 border-2 border-dashed border-[#cfc4c5] rounded-xl flex-row items-center justify-center gap-2 active:bg-[#f0eded] mb-6"
          >
            <Sparkles size={18} color="#848484" />
            <Text className="font-bold text-[12px] text-[#848484] uppercase tracking-wider">
              Re-Sync AI Matrix
            </Text>
          </Pressable>

        </View>
      </View>
    </ScrollView>
  );
});

export default MatrixTab;
