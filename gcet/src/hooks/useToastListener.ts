'use client';

import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface ToastEvent {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useToastListener() {
  const { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } = useToast();

  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<ToastEvent>) => {
      const { title, message, type } = event.detail;
      
      switch (type) {
        case 'success':
          showSuccessToast(message, title);
          break;
        case 'error':
          showErrorToast(message, title);
          break;
        case 'info':
          showInfoToast(message, title);
          break;
        case 'warning':
          showWarningToast(message, title);
          break;
        default:
          showInfoToast(message, title);
      }
    };

    window.addEventListener('showToast', handleToastEvent as EventListener);
    
    return () => {
      window.removeEventListener('showToast', handleToastEvent as EventListener);
    };
  }, [showSuccessToast, showErrorToast, showInfoToast, showWarningToast]);
}
