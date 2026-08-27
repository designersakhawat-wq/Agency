import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((firstArg, secondArg) => {
    let title = '';
    let message = '';
    let type = 'info';
    let duration = 4500;

    if (typeof firstArg === 'object' && firstArg !== null) {
      title = firstArg.title || '';
      message = firstArg.message || '';
      type = firstArg.type || 'info';
      duration = firstArg.duration || 4500;
    } else if (typeof firstArg === 'string') {
      message = firstArg;
      type = secondArg || 'info';
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Notification',
      };
      title = titles[type] || 'Notification';
    }

    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (message, title = 'Success') => addToast({ title, message, type: 'success' });
  const error = (message, title = 'Error') => addToast({ title, message, type: 'error' });
  const info = (message, title = 'Info') => addToast({ title, message, type: 'info' });
  const warning = (message, title = 'Warning') => addToast({ title, message, type: 'warning' });

  const showToast = (message, type = 'info', title = '') => {
    addToast(message, type);
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning, addToast, showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
              error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
              info: <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />,
            };

            const borders = {
              success: 'border-emerald-500/50 bg-zinc-950/95 text-emerald-100 shadow-2xl shadow-emerald-950/50',
              error: 'border-rose-500/50 bg-zinc-950/95 text-rose-100 shadow-2xl shadow-rose-950/50',
              warning: 'border-amber-500/50 bg-zinc-950/95 text-amber-100 shadow-2xl shadow-amber-950/50',
              info: 'border-teal-500/50 bg-zinc-950/95 text-teal-100 shadow-2xl shadow-teal-950/50',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-2xl ${borders[toast.type]}`}
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <h5 className="font-bold text-sm leading-tight text-white mb-1">
                      {toast.title}
                    </h5>
                  )}
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
