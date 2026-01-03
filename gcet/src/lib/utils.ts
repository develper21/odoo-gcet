import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateEmployeeId(companyName: string, firstName: string, lastName: string, joiningYear: number, serialNumber: number): string {
  const companyPrefix = companyName.substring(0, 2).toUpperCase();
  const namePrefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const yearPrefix = joiningYear.toString().slice(-2);
  const serial = serialNumber.toString().padStart(4, '0');
  
  return `${companyPrefix}${namePrefix}${yearPrefix}${serial}`;
}

export async function generateUniqueEmployeeId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `EMP-${currentYear}`;
  
  try {
    // Get all employee IDs for current year and find the max serial number
    const allUsers = await db.select({
      employeeId: users.employee_id
    }).from(users)
      .where(sql`employee_id LIKE ${yearPrefix + '%'}`);
    
    let maxSerial = 0;
    
    allUsers.forEach((user: { employeeId?: string | null }) => {
      if (user.employeeId) {
        const parts = user.employeeId.split('-');
        if (parts.length === 2) {
          const serial = parseInt(parts[1]);
          if (!isNaN(serial) && serial > maxSerial) {
            maxSerial = serial;
          }
        }
      }
    });
    
    const nextSerial = maxSerial + 1;
    return `${yearPrefix}-${nextSerial.toString().padStart(4, '0')}`;
    
  } catch (error) {
    // Fallback to simple increment if query fails
    const randomSerial = Math.floor(Math.random() * 9999) + 1;
    return `EMP-${currentYear}-${randomSerial.toString().padStart(4, '0')}`;
  }
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function calculateWorkHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

export function calculateExtraHours(checkIn: Date, checkOut: Date, standardHours: number = 8): number {
  const workHours = calculateWorkHours(checkIn, checkOut);
  return Math.max(0, workHours - standardHours);
}
