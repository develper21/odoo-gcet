import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users } from '@/lib/db/schema';
import { eq, and, between, desc, sql } from 'drizzle-orm';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { generateLeaveCSV, formatDateForExport, LeaveExportRecord } from '@/lib/csvUtils';

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
    const leaveType = searchParams.get('leaveType');

    // Build query conditions
    const conditions = [];
    
    if (userId && (payload.role === 'admin' || payload.role === 'hr')) {
      conditions.push(eq(leaves.user_id, userId));
    } else if (payload.role === 'employee') {
      conditions.push(eq(leaves.user_id, payload.userId));
    }

    if (startDate && endDate) {
      conditions.push(between(leaves.start_date, startDate, endDate));
    }

    if (status) {
      conditions.push(eq(leaves.status, status as any));
    }

    if (leaveType) {
      conditions.push(eq(leaves.leave_type, leaveType as any));
    }

    // Fetch leave data
    const leaveData = await db
      .select({
        employeeId: users.employee_id,
        employeeName: users.first_name,
        leaveType: leaves.leave_type,
        startDate: leaves.start_date,
        endDate: leaves.end_date,
        daysCount: leaves.days_count,
        reason: leaves.reason,
        status: leaves.status,
        approverComments: leaves.approver_comments,
        createdAt: leaves.created_at,
      })
      .from(leaves)
      .leftJoin(users, eq(leaves.user_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(leaves.created_at));

    // Transform data for CSV export
    const exportData: LeaveExportRecord[] = leaveData.map(record => ({
      employeeId: record.employeeId || 'N/A',
      employeeName: record.employeeName || 'Unknown',
      leaveType: record.leaveType,
      startDate: formatDateForExport(record.startDate),
      endDate: formatDateForExport(record.endDate),
      daysCount: parseFloat(record.daysCount.toString()),
      reason: record.reason,
      status: record.status,
      approverComments: record.approverComments,
      createdAt: formatDateForExport(record.createdAt || new Date()),
    }));

    // Generate CSV
    const csvContent = generateLeaveCSV(exportData);
    const filename = `leave_export_${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Leave export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
