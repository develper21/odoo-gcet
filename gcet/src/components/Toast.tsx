'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, Info, Bell } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import React from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'default';
  duration?: number;
  title?: string;
  eventId?: string;
}

interface ToastProps {
  toast: Toast;
}

export default function Toast({ toast }: ToastProps) {
  const { removeToast, toasts } = useToast();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        removeToast(toast.id);
      }, 300); // Remove from DOM after fade out
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, removeToast, toast.id]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-end space-x-4 transition-all duration-300 ease-in-out pointer-events-auto ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      style={{
        marginBottom: `${Math.max(0, (toasts.length - 1) * 80)}px`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-md backdrop-blur-sm">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {toast.type === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {toast.type === 'warning' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
            {toast.type === 'info' && <Info className="h-6 w-6 text-blue-500" />}
            {toast.type === 'default' && <Bell className="h-6 w-6 text-gray-500" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            {toast.title && (
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {toast.title}
              </p>
            )}
            <p className="text-sm text-gray-700">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => removeToast(toast.id), 300);
            }}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
