import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance } from '@/lib/db/schema';
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
