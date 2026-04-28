interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
}

export default function FormInput({ label, unit, icon, className = "", inputClassName = "", ...props }: FormInputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-bold text-black uppercase tracking-wider block" htmlFor={props.id || props.name}>
        {label}
      </label>
      <div className="relative">
        {icon}
        <input 
          {...props} 
          className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300 ${icon ? 'pl-9 pr-4' : 'px-4'} ${unit ? 'pr-12' : ''} ${inputClassName}`} 
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
