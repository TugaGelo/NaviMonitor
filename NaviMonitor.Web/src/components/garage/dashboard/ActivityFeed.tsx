import { Wrench, Rocket, Gauge, Hammer, Store, Receipt, Fuel } from 'lucide-react';
import type { MaintenanceLog, RefuelLog } from '../../../types/types';

interface ActivityFeedProps {
  maintenanceLogs: MaintenanceLog[];
  refuelLogs: RefuelLog[];
}

type FeedItem = 
  | (RefuelLog & { feedType: 'Refuel' })
  | (MaintenanceLog & { feedType: 'Maintenance' | 'Modification' });

export default function ActivityFeed({ maintenanceLogs, refuelLogs }: ActivityFeedProps) {
  const activities: FeedItem[] = [
    ...refuelLogs.map(log => ({ ...log, feedType: 'Refuel' as const })),
    ...maintenanceLogs.map(log => ({ ...log, feedType: log.logType as 'Maintenance' | 'Modification' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (activities.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No activities logged yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 md:pl-12 py-4">
      <div className="absolute left-3.75 top-8 bottom-4 w-0.5 bg-zinc-200 rounded-full"></div>

      <div className="space-y-8">
        {activities.map((activity, idx) => {
          
          if (activity.feedType === 'Refuel') {
            return (
              <div key={`refuel-${activity.id}-${idx}`} className="relative group">
                <div className="absolute -left-8 md:-left-12 w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shadow-sm z-10 border-4 border-white transition-transform group-hover:scale-110">
                  <Fuel className="w-4 h-4 text-zinc-600" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-zinc-500 font-bold text-xs mb-1 uppercase tracking-wider">{new Date(activity.date).toLocaleDateString()}</div>
                      <h3 className="font-black text-lg text-black">{activity.volume}L Fill-up</h3>
                    </div>
                    <div className="font-black text-lg text-black">₱{activity.totalCost.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                      <Gauge className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-black">{activity.odometer.toLocaleString()} km</span>
                    </div>
                    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                      <Fuel className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-black">{activity.fuelType || 'Unleaded'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (activity.feedType === 'Modification') {
            return (
              <div key={`mod-${activity.id}-${idx}`} className="relative group">
                <div className="absolute -left-8 md:-left-12 w-8 h-8 rounded-md bg-black flex items-center justify-center shadow-sm z-10 border-4 border-white rotate-45 overflow-hidden transition-transform group-hover:scale-110">
                  <div className="-rotate-45 flex items-center justify-center w-full h-full text-white">
                    <Rocket className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div>
                      <div className="text-zinc-500 font-bold text-xs mb-1 uppercase tracking-wider">{new Date(activity.date).toLocaleDateString()}</div>
                      <h3 className="font-black text-lg text-black">{activity.serviceType}</h3>
                    </div>
                    <div className="font-black text-lg text-black">₱{activity.price.toFixed(2)}</div>
                  </div>
                  {activity.notes && <p className="text-sm font-medium text-zinc-500 mb-5">{activity.notes}</p>}
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                      <Gauge className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-black">{activity.odometer.toLocaleString()} km</span>
                    </div>
                    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                      {activity.isDIY ? <Hammer className="w-4 h-4 text-zinc-400" /> : <Store className="w-4 h-4 text-zinc-400" />}
                      <span className="text-xs font-bold text-black">{activity.isDIY ? 'DIY Install' : activity.shopName || 'Pro Install'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={`maint-${activity.id}-${idx}`} className="relative group">
              <div className="absolute -left-8 md:-left-12 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-sm z-10 border-4 border-white transition-transform group-hover:scale-110">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-zinc-500 font-bold text-xs mb-1 uppercase tracking-wider">{new Date(activity.date).toLocaleDateString()}</div>
                    <h3 className="font-black text-lg text-black">{activity.serviceType}</h3>
                  </div>
                  <div className="font-black text-lg text-black">₱{activity.price.toFixed(2)}</div>
                </div>
                {activity.notes && <p className="text-sm font-medium text-zinc-500 mb-5">{activity.notes}</p>}
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                    <Gauge className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-black">{activity.odometer.toLocaleString()} km</span>
                  </div>
                  <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                    {activity.isDIY ? <Hammer className="w-4 h-4 text-zinc-400" /> : <Store className="w-4 h-4 text-zinc-400" />}
                    <span className="text-xs font-bold text-black">{activity.isDIY ? 'DIY Service' : activity.shopName || 'Pro Service'}</span>
                  </div>
                  {!activity.isDIY && activity.mechanicName && (
                    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-200">
                      <Receipt className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-black">{activity.mechanicName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        })}
      </div>
    </div>
  );
}
