import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    const today = new Date().toISOString().split('T')[0];
    
    const [existingAttendance] = await db.select()
      .from(attendance)
      .where(and(
        eq(attendance.user_id, payload.userId),
        eq(attendance.date, today)
      ))
      .limit(1);

    if (!existingAttendance || !existingAttendance.check_in) {
      return NextResponse.json(
        { error: 'No check-in record found for today' },
        { status: 400 }
      );
    }

    if (existingAttendance.check_out) {
      return NextResponse.json(
        { error: 'Already checked out today' },
        { status: 400 }
      );
    }

    const now = new Date();
    
    await db.update(attendance)
      .set({
        check_out: now,
        updated_at: now,
      })
      .where(eq(attendance.id, existingAttendance.id));

    return NextResponse.json({
      message: 'Check-out successful',
      checkOutTime: now,
    });

  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
