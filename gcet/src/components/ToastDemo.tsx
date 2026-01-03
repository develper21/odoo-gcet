'use client';

import { useToast } from '@/contexts/ToastContext';

export default function ToastDemo() {
  const { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } = useToast();

  const handleShowSuccess = () => {
    showSuccessToast('Leave approved successfully!', 'Success');
  };

  const handleShowError = () => {
    showErrorToast('Leave request was rejected.', 'Error');
  };

  const handleShowInfo = () => {
    showInfoToast('Your payroll has been published.', 'Information');
  };

  const handleShowWarning = () => {
    showWarningToast('Your leave balance is running low.', 'Warning');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast Notifications Demo</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleShowSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Success
        </button>
        <button
          onClick={handleShowError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Error
        </button>
        <button
          onClick={handleShowInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Info
        </button>
        <button
          onClick={handleShowWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          Warning
        </button>
      </div>
    </div>
  );
}
