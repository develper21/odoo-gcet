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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = db.select({
      id: attendance.id,
      date: attendance.date,
      checkIn: attendance.check_in,
      checkOut: attendance.check_out,
      status: attendance.status,
      notes: attendance.notes,
    }).from(attendance).where(eq(attendance.user_id, payload.userId));

    if (from && to) {
      query = db.select({
        id: attendance.id,
        date: attendance.date,
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
        status: attendance.status,
        notes: attendance.notes,
      }).from(attendance).where(and(
        eq(attendance.user_id, payload.userId),
        gte(attendance.date, from),
        lte(attendance.date, to)
      ));
    }

    const records = await query.orderBy(attendance.date);

    const attendanceRecords = records.map((record: any) => {
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
      };
    });

    return NextResponse.json(attendanceRecords);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
