'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Settings, User } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useToastListener } from '@/hooks/useToastListener';
import ToastDemo from '@/components/ToastDemo';
import { LoadingState, EmptyState, PageLoading } from '@/components/ui';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'present' | 'absent' | 'leave';
  profilePictureUrl?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePictureUrl?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const router = useRouter();
  
  // Initialize toast listener
  useToastListener();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.role !== 'employee') {
          fetchEmployees();
        }
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchEmployees]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchEmployees = useCallback(async () => {
    setIsEmployeesLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch {
      // Error handling without console.log
    } finally {
      setIsEmployeesLoading(false);
    }
  }, []);

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
      });
      if (response.ok) {
        setIsCheckedIn(true);
      }
    } catch {
      // Error handling without console.log
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
      });
      if (response.ok) {
        setIsCheckedIn(false);
      }
    } catch {
      // Error handling without console.log
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      // Error handling without console.log
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  if (!user) {
    return <PageLoading message="Redirecting to login..." />;
  }

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'leave':
        return 'bg-red-500';
      case 'absent':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">DF</span>
                </div>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Employees
                </Link>
                <Link
                  href="/attendance"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
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
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <NotificationBell userId={user?.id || ''} />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt={user.firstName}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

            {/* Toast Demo - Remove in production */}
            {process.env.NODE_ENV === 'development' && <ToastDemo />}

            {/* Employee Cards */}
            {isEmployeesLoading ? (
              <LoadingState message="Loading employees..." />
            ) : filteredEmployees.length === 0 ? (
              <EmptyState
                icon="users"
                title="No employees found"
                description={searchQuery ? "Try adjusting your search criteria" : "No employees available"}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/employees/${employee.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          {employee.profilePictureUrl ? (
                            <Image
                              src={employee.profilePictureUrl}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(employee.status)}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Attendance Panel */}
        <aside className="w-80 bg-white shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCheckedIn
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Check IN
                </button>
                
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !isCheckedIn
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Check Out
                </button>
              </div>

              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${isCheckedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isCheckedIn ? 'Checked In' : 'Checked Out'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <Link
                href="/settings"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
