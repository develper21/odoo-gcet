import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, users } from '@/lib/db/schema';
import { authenticateRequest, requireEmployee } from '@/lib/rbac';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const roleCheck = requireEmployee(auth.user!);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    
    const [existingAttendance] = await db.select()
      .from(attendance)
      .where(and(
        eq(attendance.user_id, auth.user!.id),
        eq(attendance.date, today)
      ))
      .limit(1);

    if (existingAttendance && existingAttendance.check_in) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    const now = new Date();
    
    if (existingAttendance) {
      await db.update(attendance)
        .set({
          check_in: now,
          status: 'present',
          updated_at: now,
        })
        .where(eq(attendance.id, existingAttendance.id));
    } else {
      await db.insert(attendance).values({
        user_id: auth.user!.id,
        date: today,
        check_in: now,
        status: 'present',
      });
    }

    return NextResponse.json({
      message: 'Check-in successful',
      checkInTime: now,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
