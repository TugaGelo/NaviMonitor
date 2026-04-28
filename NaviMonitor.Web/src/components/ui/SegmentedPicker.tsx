import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Option<T> {
  value: T;
  label: string | React.ReactNode;
  icon?: LucideIcon; 
}

interface SegmentedPickerProps<T> {
  label?: string;
  options: Option<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export default function SegmentedPicker<T>({ label, options, selectedValue, onChange }: SegmentedPickerProps<T>) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-bold text-black uppercase tracking-wider block">{label}</label>}
      <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
        {options.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all ${
                isSelected ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
