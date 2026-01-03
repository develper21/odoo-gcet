export interface AttendanceExportRecord {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  notes: string | null;
  workHours: string;
}

export interface LeaveExportRecord {
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: string;
  approverComments: string | null;
  createdAt: string;
}

export function generateAttendanceCSV(data: AttendanceExportRecord[]): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Date',
    'Check In',
    'Check Out',
    'Status',
    'Notes',
    'Work Hours'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      record.employeeId,
      record.employeeName,
      record.date,
      record.checkIn || '',
      record.checkOut || '',
      record.status,
      record.notes || '',
      record.workHours
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function generateLeaveCSV(data: LeaveExportRecord[]): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Leave Type',
    'Start Date',
    'End Date',
    'Days Count',
    'Reason',
    'Status',
    'Approver Comments',
    'Created At'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      record.employeeId,
      record.employeeName,
      record.leaveType,
      record.startDate,
      record.endDate,
      record.daysCount.toString(),
      record.reason || '',
      record.status,
      record.approverComments || '',
      record.createdAt
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a') as HTMLAnchorElement;
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function formatDateForExport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function calculateWorkHours(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '0:00';
  
  try {
    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    const diffMs = outTime.getTime() - inTime.getTime();
    
    if (diffMs <= 0) return '0:00';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return '0:00';
  }
}
