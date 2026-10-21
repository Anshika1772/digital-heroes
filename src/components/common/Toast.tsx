import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-forest-700 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-300 bg-cream-50',
    error: 'border-rose-300 bg-cream-50',
    info: 'border-forest-300 bg-cream-50',
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-refined-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs sm:text-sm text-ink-700 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-400 hover:text-ink-800 p-0.5 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
