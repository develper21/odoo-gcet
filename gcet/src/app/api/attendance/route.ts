import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and, gte, lte } from 'drizzle-orm';

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

    // Get user info to check role
    const user = await db.select({
      role: users.role,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentUser = user[0];
    
    // Only allow HR and Admin to access all attendance data
    if (currentUser.role === 'employee') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userId = searchParams.get('userId');

    // Build where conditions
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(attendance.user_id, userId));
    }

    if (from && to) {
      conditions.push(gte(attendance.date, from));
      conditions.push(lte(attendance.date, to));
    }

    // Build the query with conditional where
    const queryBuilder = db.select({
      id: attendance.id,
      date: attendance.date,
      checkIn: attendance.check_in,
      checkOut: attendance.check_out,
      status: attendance.status,
      notes: attendance.notes,
      user: {
        id: users.id,
        firstName: users.first_name,
        lastName: users.last_name,
        email: users.email,
        employeeId: users.employee_id,
      },
    })
    .from(attendance)
    .leftJoin(users, eq(attendance.user_id, users.id));

    const query = conditions.length > 0 
      ? queryBuilder.where(and(...conditions))
      : queryBuilder;

    const records = await query.orderBy(attendance.date);

    interface AttendanceQueryRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  notes: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    employeeId: string | null;
  } | null;
}

    const attendanceRecords = records.map((record: AttendanceQueryRecord) => {
      let workHours = '00:00';
      let extraHours = '00:00';

      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        workHours = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
        
        const standardHours = 8;
        if (diffHours > standardHours) {
          const extraHoursNum = diffHours - standardHours;
          extraHours = `${extraHoursNum.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
        }
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: record.checkIn?.toISOString() || '',
        checkOut: record.checkOut?.toISOString() || '',
        workHours,
        extraHours,
        status: record.status,
        user: record.user,
      };
    });

    return NextResponse.json(attendanceRecords);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
