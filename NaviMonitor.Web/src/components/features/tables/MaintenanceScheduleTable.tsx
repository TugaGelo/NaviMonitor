import React from 'react';
import { CheckCircle2, RotateCcw, Search, Droplets } from 'lucide-react';
import type { MaintenanceMatrixItem, MaintenanceLog } from '../../../types/types';

interface MaintenanceScheduleTableProps {
  matrix: MaintenanceMatrixItem[];
  currentOdometer: number;
  logs: MaintenanceLog[];
  onCellClick: (task: string, action: string, odoPoint: number) => void;
}

export default function MaintenanceScheduleTable({ matrix, currentOdometer, logs, onCellClick }: MaintenanceScheduleTableProps) {
  
  const masterInterval = matrix.length > 0 ? Math.min(...matrix.map(i => i.interval)) : 4000;
  const initialPoint = matrix.find(i => i.initial)?.initial || 0;

  const getColumns = () => {
    if (matrix.length === 0) return [1000, 4000, 8000, 12000, 16000];
    const currentCycle = Math.max(0, Math.floor((currentOdometer - initialPoint) / masterInterval));
    const cols = [];
    for (let i = -1; i <= 3; i++) {
      const point = initialPoint + ((currentCycle + i) * masterInterval);
      if (point >= initialPoint) cols.push(point);
    }
    return Array.from(new Set(cols)).sort((a, b) => a - b).slice(0, 5);
  };

  const columns = getColumns();
  const nextMilestone = columns.find(c => c >= currentOdometer) || columns[columns.length - 1];

  const isCompleted = (taskName: string, action: string, odoPoint: number) => {
    const tolerance = Math.max(500, masterInterval * 0.4); 

    return logs.some(log => {
      const safeLogName = (log.serviceType || '').toLowerCase();
      const safeTaskName = (taskName || '').toLowerCase().trim();
      const safeAction = (action || '').toLowerCase().trim();
      
      const isNameMatch = safeLogName.includes(safeTaskName) || safeLogName === `${safeAction} ${safeTaskName}`;
      const isOdoMatch = Math.abs((log.odometer || 0) - odoPoint) <= tolerance;

      return isNameMatch && isOdoMatch;
    });
  };

  const getActionIcon = (action: string, isDone: boolean) => {
    if (isDone) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    const act = action.toLowerCase();
    if (act.includes('replace')) return <RotateCcw className="w-5 h-5 text-secondary" />;
    if (act.includes('clean')) return <Droplets className="w-5 h-5 text-blue-500" />;
    return <Search className="w-5 h-5 text-zinc-400" />;
  };

  const labelTextStyle = "font-black text-[10px] text-zinc-500 uppercase tracking-widest";
  const borderStyle = "border-b border-r border-zinc-200";
  const headerHeight = "h-20";
  const rowHeight = "h-16";

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div 
          className="min-w-225 grid" 
          style={{ gridTemplateColumns: `240px repeat(${columns.length}, 1fr)` }}
        >
          <div className={`${headerHeight} ${borderStyle} bg-zinc-50/80 p-4 flex items-center ${labelTextStyle}`}>
            Component
          </div>
          
          {columns.map((odo) => {
            const isActive = odo === nextMilestone;
            return (
              <div 
                key={odo} 
                className={`${headerHeight} ${borderStyle} flex flex-col items-center justify-center transition-all ${
                  isActive ? 'bg-black text-white' : 'bg-zinc-50/50 text-zinc-400'
                }`}
              >
                <span className={`font-black text-base ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                  {odo.toLocaleString()}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-zinc-500' : 'opacity-60'}`}>
                  km
                </span>
              </div>
            );
          })}

          {matrix.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className={`${rowHeight} ${borderStyle} bg-zinc-50/80 px-4 flex items-center sticky left-0 z-20 shadow-[1px_0_0_0_#e4e4e7] ${labelTextStyle}`}>
                {item.item}
              </div>
              
              {columns.map((odo) => {
                const isApplicable = (item.initial === odo) || (odo > (item.initial || 0) && (odo - (item.initial || 0)) % item.interval === 0);
                const done = isCompleted(item.item, item.action, odo);
                const isActive = odo === nextMilestone;
                
                const canLog = isApplicable && !done;

                return (
                  <button 
                    key={odo}
                    disabled={!canLog}
                    onClick={() => onCellClick(item.item, item.action, odo)}
                    className={`${rowHeight} ${borderStyle} flex flex-col justify-center items-center gap-0.5 group transition-all outline-none ${
                      isActive ? 'bg-zinc-900/2' : 'bg-white'
                    } ${canLog ? 'hover:bg-zinc-900/6 cursor-pointer' : 'cursor-default'}`}
                  >
                    {isApplicable ? (
                      <>
                        <div className={`flex items-center justify-center h-6 transition-transform ${canLog ? 'group-active:scale-90' : ''}`}>
                          {getActionIcon(item.action, done)}
                        </div>
                        {!done && (
                          <span className={`text-[7px] leading-none font-black uppercase ${isActive ? 'opacity-100 text-zinc-500' : 'opacity-0 group-hover:opacity-100 text-zinc-400'}`}>
                            {item.action}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-zinc-200 text-[10px] font-black opacity-20">-</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
