'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, User, Download } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const startDate = new Date(currentTime);
      const endDate = new Date(currentTime);
      
      if (selectedView === 'month') {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
      }

      const params = new URLSearchParams({
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      });

      // Add userId filter for admin view if specific employee is selected
      if (user && user.role !== 'employee' && selectedEmployee !== 'all') {
        params.set('userId', selectedEmployee);
      }

      // Choose the right endpoint based on user role
      const endpoint = user && user.role !== 'employee' 
        ? `/api/attendance?${params}`
        : `/api/attendance/me?${params}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTime, selectedView, user, selectedEmployee]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      if (user.role !== 'employee') {
        fetchEmployees();
      }
      fetchAttendance();
    }
  }, [user, fetchEmployees, fetchAttendance]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentTime);
    if (selectedView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentTime(newDate);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    if (selectedView === 'day') {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const handleExportAttendance = async () => {
    try {
      setActionLoading(true);
      const params = new URLSearchParams();
      
      // Add date range if needed
      if (selectedView === 'month') {
        const startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).toISOString().split('T')[0];
        params.set('from', startDate);
        params.set('to', endDate);
      } else {
        // For day view, use current date
        const currentDate = currentTime.toISOString().split('T')[0];
        params.set('from', currentDate);
        params.set('to', currentDate);
      }
      
      // Add user filter for HR/Admin if specific employee is selected
      if (user && user.role !== 'employee' && selectedEmployee !== 'all') {
        params.set('userId', selectedEmployee);
      }
      
      // Use the appropriate export endpoint
      const exportEndpoint = user && user.role !== 'employee' 
        ? `/api/export/attendance?${params.toString()}`
        : `/api/export/attendance/me?${params.toString()}`;
      
      const response = await fetch(exportEndpoint);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Error handling without console.log
      }
    } catch {
      // Error handling without console.log
    } finally {
      setActionLoading(false);
    }
  };

  const calculateStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const leaves = attendanceRecords.filter(r => r.status === 'leave').length;
    const total = attendanceRecords.length;
    return { present, leaves, total };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">DF</span>
                  </div>
                </Link>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Employees
                </Link>
                <Link
                  href="/attendance"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Attendance
                </Link>
                <Link
                  href="/leave"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Time Off
                </Link>
                <Link
                  href="/payroll"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Payroll
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <NotificationBell userId={user?.id || ''} />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.role === 'employee' ? 'For Employees' : 'Attendance'}
                </h1>
                
                {/* Employee Selector for Admin/HR */}
                {user.role !== 'employee' && (
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} {emp.employeeId && `(${emp.employeeId})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Export Button */}
              <button
                onClick={handleExportAttendance}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" d="M4 12a8 8 0L12 20a8 8 0l-1 1-1 1-5-1-1 1-5-1-1z M12 2a8 8 0l-1 1-1 1-5-1-1 1-5-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Exporting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </div>
                )}
              </button>
              
              {/* Date Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value as 'day' | 'month')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                  </select>
                  <span className="text-lg font-medium text-gray-900">
                    {formatDate(currentTime)}
                  </span>
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {user.role === 'employee' && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-sm text-gray-500">Count of days present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.leaves}</p>
                  <p className="text-sm text-gray-500">Leaves count</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total working days</p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {user.role !== 'employee' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      {user.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="ml-2">
                              <span className="text-sm text-gray-900">
                                {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown'}
                              </span>
                              {record.user?.employeeId && (
                                <span className="text-xs text-gray-500 block">
                                  {record.user.employeeId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workHours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.extraHours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
