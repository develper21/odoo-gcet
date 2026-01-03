import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { eq, and, between, desc, gte, lte } from 'drizzle-orm';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { generateAttendanceCSV, downloadCSV, formatDateForExport, calculateWorkHours as calculateWorkHoursCSV, AttendanceExportRecord } from '@/lib/csvUtils';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [];
    
    if (userId && (payload.role === 'admin' || payload.role === 'hr')) {
      conditions.push(eq(attendance.user_id, userId));
    } else if (payload.role === 'employee') {
      conditions.push(eq(attendance.user_id, payload.userId));
    }

    if (startDate && endDate) {
      conditions.push(between(attendance.date, startDate, endDate));
    }

    if (status) {
      conditions.push(eq(attendance.status, status as any));
    }

    // Fetch attendance data
    const attendanceData = await db
      .select({
        employeeId: users.employee_id,
        employeeName: users.first_name,
        date: attendance.date,
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
        status: attendance.status,
        notes: attendance.notes,
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.user_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date));

    // Transform data for CSV export
    const exportData: AttendanceExportRecord[] = attendanceData.map(record => ({
      employeeId: record.employeeId || 'N/A',
      employeeName: record.employeeName || 'Unknown',
      date: formatDateForExport(record.date),
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '',
      status: record.status,
      notes: record.notes,
      workHours: calculateWorkHoursCSV(
        record.checkIn ? record.checkIn.toISOString() : null,
        record.checkOut ? record.checkOut.toISOString() : null
      )
    }));

    // Generate CSV
    const csvContent = generateAttendanceCSV(exportData);
    const filename = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Attendance export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
