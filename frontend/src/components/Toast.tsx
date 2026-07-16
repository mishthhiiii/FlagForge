import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useFlags } from '../context/FlagContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFlags();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'text-blue-400';
          let borderTheme = 'border-blue-500/10';
          let bgTheme = 'bg-blue-500/5';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
            borderTheme = 'border-emerald-500/10';
            bgTheme = 'bg-emerald-500/5';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-red-400';
            borderTheme = 'border-red-500/10';
            bgTheme = 'bg-red-500/5';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto w-full bg-zinc-950 border ${borderTheme} ${bgTheme} rounded-md shadow-2xl p-4 flex items-start gap-3 backdrop-blur-md`}
            >
              <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-grow">
                <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-100 transition-colors p-0.5 rounded-md hover:bg-zinc-900 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
export default ToastContainer;
