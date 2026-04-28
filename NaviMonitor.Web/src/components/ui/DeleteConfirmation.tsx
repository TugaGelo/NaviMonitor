import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationProps {
  itemName: React.ReactNode;
  warningText?: string;
  error?: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmation({ 
  itemName, 
  warningText = "This action cannot be undone. You are about to permanently delete:", 
  error, 
  isDeleting, 
  onCancel, 
  onConfirm 
}: DeleteConfirmationProps) {
  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4 mb-8 mt-2">
        <div className="w-20 h-20 bg-red-50 text-secondary rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black mb-2">Are you absolutely sure?</h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-sm mx-auto">
            {warningText}
            <span className="font-bold text-black text-base mt-3 block">{itemName}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onCancel} 
          className="flex-1 py-3.5 font-bold text-black bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          disabled={isDeleting}
          className="flex-1 py-3.5 font-bold text-white bg-secondary hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5" />
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  );
}
