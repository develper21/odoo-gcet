'use client';

import { useEffect } from 'react';

interface ToastNotification {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useNotificationTrigger() {
  useEffect(() => {
    const handleApiResponse = (event: CustomEvent) => {
      const { toast } = event.detail;
      
      if (toast) {
        // Trigger toast notification
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: toast
        }));
      }
    };

    // Listen for API responses that might contain notifications
    window.addEventListener('apiResponse', handleApiResponse as EventListener);
    
    return () => {
      window.removeEventListener('apiResponse', handleApiResponse as EventListener);
    };
  }, []);
}

// Helper function to trigger notifications from API responses
export function triggerNotificationFromAPI(response: any) {
  if (response.toast) {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: response.toast
    }));
  }
}
