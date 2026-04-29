import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  headerRight?: React.ReactNode;
}

export default function BaseModal({ 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = 'max-w-2xl',
  headerRight 
}: BaseModalProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => { 
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; 
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        
        <div className="p-6 border-b border-zinc-100 sticky top-0 bg-white z-10 rounded-t-2xl flex justify-between items-start md:items-center gap-4 flex-col md:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-black">{title}</h2>
            {subtitle && <p className="text-sm font-medium text-zinc-500 mt-1">{subtitle}</p>}
          </div>
          
          {headerRight && (
            <div className="shrink-0 w-full md:w-auto">
              {headerRight}
            </div>
          )}
        </div>

        <div className="overflow-y-auto">
          {children}
        </div>
        
      </motion.div>
    </div>
  );
}
