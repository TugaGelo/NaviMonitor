import { LogOut } from 'lucide-react';
import BaseModal from '../../ui/modals/BaseModal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      maxWidth="max-w-[400px]"
    >
      <div className="flex flex-col items-center text-center px-6 pb-8 pt-2">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <LogOut className="w-8 h-8 text-zinc-900" strokeWidth={2.5} />
        </div>
        <h2 className="font-black text-zinc-900 text-xl tracking-wider uppercase mb-4">
          End Session?
        </h2>
        <p className="text-sm text-zinc-500 font-medium mb-8 px-2 leading-relaxed">
          You are about to sign out of the Navi Desktop Portal. Secure data sync will pause until your next login.
        </p>
        <div className="w-full space-y-3">
          <button 
            type="button" 
            onClick={onConfirm}
            className="w-full py-4 bg-zinc-900 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-lg hover:bg-black transition-colors active:scale-[0.98]"
          >
            Confirm Logout
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="w-full py-4 bg-transparent text-zinc-400 font-bold text-sm uppercase tracking-widest rounded-lg hover:text-zinc-600 transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
