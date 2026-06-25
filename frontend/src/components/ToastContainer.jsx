import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300';
      case 'error':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300';
      default:
        return 'bg-slate-50 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200';
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto fade-in ${getToastStyle(
            toast.type
          )}`}
        >
          <div className="flex gap-2.5 items-start">
            <div className="mt-0.5">{getToastIcon(toast.type)}</div>
            <p className="text-xs font-semibold leading-normal">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-75 transition-opacity mt-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
