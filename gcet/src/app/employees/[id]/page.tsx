'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Phone, Building, Users, Calendar, Edit, Briefcase } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import { useToastListener } from '@/hooks/useToastListener';

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfJoining?: string;
  nationality?: string;
  personalEmail?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    panNumber: string;
    uanNumber: string;
    empCode: string;
  };
  salaryStructure?: {
    baseSalary: number;
    basicPercentage: number;
    hraPercentage: number;
    standardAllowance: number;
    performanceBonusPercentage: number;
    ltaPercentage: number;
    pfEmployeeRate: number;
    pfEmployerRate: number;
    professionalTax: number;
  };
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  
  // Initialize toast listener
  useToastListener();

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      }
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleProfilePictureUpload = async (file: File, fileType: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'profile_picture');
      formData.append('fileName', fileName);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await response.json();
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Profile Picture Updated',
            message: 'Your profile picture has been successfully updated.',
            type: 'success'
          }
        }));
        
        // Refresh employee data to show new profile picture
        fetchEmployee();
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Upload Failed',
          message: 'Failed to upload profile picture. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const handleDocumentUpload = async (file: File, fileType: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('fileName', fileName);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await response.json();
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Document Uploaded',
            message: 'Your document has been successfully uploaded.',
            type: 'success'
          }
        }));
        
        // Refresh documents list
        setRefreshDocuments(prev => prev + 1);
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Upload Failed',
          message: 'Failed to upload document. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Employee not found</div>
      </div>
    );
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      {employee.profilePictureUrl ? (
                        <Image
                          src={employee.profilePictureUrl}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-full"
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h2>
                      <p className="text-gray-500">{employee.jobTitle}</p>
                      <p className="text-sm text-gray-500">Login ID: {employee.employeeId || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  {isEditing && (
                    <div className="mb-6">
                      <FileUpload
                        onUploadAction={handleProfilePictureUpload}
                        fileType="profile_picture"
                        label="Profile Picture"
                        acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
                        currentFile={employee.profilePictureUrl?.split('/').pop()}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{employee.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="text-sm font-medium">Dayflow HRMS</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-sm font-medium">{employee.department || 'Not assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Manager</p>
                        <p className="text-sm font-medium">Not assigned</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium">Head Office</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-200">
                  <nav className="flex space-x-8">
                    {['resume', 'private', 'documents', 'salary', 'security'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'private' ? 'Info' : ''}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === 'resume' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                        <p className="text-gray-600">
                          Experienced professional with a strong background in human resources and team management.
                          Passionate about creating efficient workflows and fostering positive work environments.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What I love about my job</h3>
                        <p className="text-gray-600">
                          I enjoy helping team members grow professionally and solving complex organizational challenges.
                          The opportunity to make a real impact on company culture and employee satisfaction is incredibly rewarding.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">My interests and hobbies</h3>
                        <p className="text-gray-600">
                          Outside of work, I enjoy reading, hiking, and exploring new technologies. I&apos;m also passionate about
                          mentoring young professionals and contributing to community initiatives.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'private' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-sm font-medium">{employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-sm font-medium">{employee.gender || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Marital Status</p>
                            <p className="text-sm font-medium">{employee.maritalStatus || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nationality</p>
                            <p className="text-sm font-medium">{employee.nationality || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Personal Email</p>
                            <p className="text-sm font-medium">{employee.personalEmail || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Joining</p>
                            <p className="text-sm font-medium">{employee.dateOfJoining ? formatDate(employee.dateOfJoining) : 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Residing Address</h3>
                        <p className="text-gray-600">{employee.address || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      {/* Document Upload */}
                      {isEditing && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
                          <FileUpload
                            onUploadAction={handleDocumentUpload}
                            fileType="document"
                            label="Upload New Document"
                            acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt']}
                          />
                        </div>
                      )}

                      {/* Documents List */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                        <DocumentList
                          userId={employee.id}
                          refreshTrigger={refreshDocuments}
                          canDelete={isEditing}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'salary' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Salary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Month Wage</p>
                            <p className="text-lg font-medium">{formatCurrency(50000)} / Month</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Yearly Wage</p>
                            <p className="text-lg font-medium">{formatCurrency(600000)} / Yearly</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Components</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Basic Salary (50.00%)</span>
                            <span className="text-sm font-medium">{formatCurrency(25000)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">House Rent Allowance (50.00%)</span>
                            <span className="text-sm font-medium">{formatCurrency(12500)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Standard Allowance</span>
                            <span className="text-sm font-medium">{formatCurrency(4167)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Performance Bonus (8.33%)</span>
                            <span className="text-sm font-medium">{formatCurrency(2082.50)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Leave Travel Allowance (8.33%)</span>
                            <span className="text-sm font-medium">{formatCurrency(2082.50)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fixed Allowance</span>
                            <span className="text-sm font-medium">{formatCurrency(2918)} / month</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Provident Fund Contribution</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employee (12.00%)</span>
                            <span className="text-sm font-medium">{formatCurrency(3000)} / month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employer (12.00%)</span>
                            <span className="text-sm font-medium">{formatCurrency(3000)} / month</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Deductions</h3>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Professional Tax</span>
                          <span className="text-sm font-medium">{formatCurrency(200)} / month</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Account Number</p>
                            <p className="text-sm font-medium">**** **** **** 1234</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bank Name</p>
                            <p className="text-sm font-medium">State Bank of India</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">IFSC Code</p>
                            <p className="text-sm font-medium">SBIN0001234</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">PAN Number</p>
                            <p className="text-sm font-medium">ABCDE1234F</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">UAN Number</p>
                            <p className="text-sm font-medium">123456789012</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Emp Code</p>
                            <p className="text-sm font-medium">EMP001</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Leadership</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Communication</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Problem Solving</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    + Add Skills
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification</h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <p className="font-medium">HR Management Certification</p>
                      <p className="text-gray-500">2023 - Valid until 2026</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    + Add Certification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
