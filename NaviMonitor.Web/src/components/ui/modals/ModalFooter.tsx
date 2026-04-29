import type { LucideIcon } from 'lucide-react';

interface ModalFooterProps {
  onClose: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitIcon: LucideIcon;
  isEditMode?: boolean;
}

export default function ModalFooter({ onClose, isSubmitting, submitLabel, submitIcon: Icon, isEditMode }: ModalFooterProps) {
  return (
    <div className="border-t border-zinc-100 pt-6 px-6 pb-6 bg-zinc-50/50 flex justify-end gap-4 rounded-b-2xl mt-auto">
      <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-white transition-all">
        Cancel
      </button>
      <button 
        disabled={isSubmitting} 
        type="submit" 
        className="px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
      >
        {isSubmitting ? 'Saving...' : <><Icon className="w-5 h-5" /> {isEditMode ? `Update ${submitLabel}` : `Save ${submitLabel}`}</>}
      </button>
    </div>
  );
}
