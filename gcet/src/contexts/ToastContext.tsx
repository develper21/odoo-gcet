'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  title?: string;
  eventId?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccessToast: (message: string, title?: string) => void;
  showErrorToast: (message: string, title?: string) => void;
  showInfoToast: (message: string, title?: string) => void;
  showWarningToast: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...toast,
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccessToast = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'success', title, duration: 5000 });
  }, [addToast]);

  const showErrorToast = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'error', title, duration: 7000 });
  }, [addToast]);

  const showInfoToast = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'info', title, duration: 5000 });
  }, [addToast]);

  const showWarningToast = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'warning', title, duration: 6000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast,
      showSuccessToast,
      showErrorToast,
      showInfoToast,
      showWarningToast
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
