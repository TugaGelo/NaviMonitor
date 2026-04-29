import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string | ReactNode;
  icon?: LucideIcon;
  color?: 'primary' | 'secondary';
  trend?: { value: string; isUp: boolean };
  progress?: number;
  action?: ReactNode;
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  color = 'primary',
  trend,
  progress,
  action
}: StatCardProps) {
  const isSecondary = color === 'secondary';

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group h-full min-h-32">
      
      <div className="flex justify-between items-start mb-4">
        <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">{label}</span>
        {action ? (
          <div>{action}</div>
        ) : Icon ? (
          <Icon className="text-zinc-300 w-5 h-5" />
        ) : null}
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-end gap-1">
          {prefix && <span className={`text-xl font-black mb-1 ${isSecondary ? 'text-secondary' : 'text-black'}`}>{prefix}</span>}
          <span className={`text-3xl lg:text-4xl font-black tracking-tight ${isSecondary ? 'text-secondary' : 'text-black'}`}>
            {value}
          </span>
          {suffix && <span className="text-sm lg:text-lg text-zinc-400 font-medium mb-1 ml-1">{suffix}</span>}
        </div>
      </div>

      {trend && (
        <div className="mt-2">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{trend.value}</div>
        </div>
      )}

      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-100">
          <div 
            className={`h-full transition-all duration-1000 ${isSecondary ? 'bg-secondary' : 'bg-black'}`} 
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
