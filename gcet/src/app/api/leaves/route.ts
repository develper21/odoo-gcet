import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users } from '@/lib/db/schema';
import { authenticateRequest, requireEmployee } from '@/lib/rbac';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { createLeaveNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
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

    let leaveRecords;
    
    if (auth.user!.role === 'employee') {
      leaveRecords = await db.select({
        id: leaves.id,
        user_id: leaves.user_id,
        leave_type: leaves.leave_type,
        start_date: leaves.start_date,
        end_date: leaves.end_date,
        days_count: leaves.days_count,
        reason: leaves.reason,
        status: leaves.status,
        approver_id: leaves.approver_id,
        approver_comments: leaves.approver_comments,
        created_at: leaves.created_at,
        updated_at: leaves.updated_at,
      }).from(leaves).where(eq(leaves.user_id, auth.user!.id)).orderBy(desc(leaves.created_at));
    } else {
      leaveRecords = await db.select({
        id: leaves.id,
        user_id: leaves.user_id,
        leave_type: leaves.leave_type,
        start_date: leaves.start_date,
        end_date: leaves.end_date,
        days_count: leaves.days_count,
        reason: leaves.reason,
        status: leaves.status,
        approver_id: leaves.approver_id,
        approver_comments: leaves.approver_comments,
        created_at: leaves.created_at,
        updated_at: leaves.updated_at,
      }).from(leaves).orderBy(desc(leaves.created_at));
    }

    const leaveWithNames = await Promise.all(
      leaveRecords.map(async (leave: any) => {
        const [leaveUser] = await db.select({
          firstName: users.first_name,
          lastName: users.last_name,
        }).from(users).where(eq(users.id, leave.user_id)).limit(1);

        return {
          id: leave.id,
          name: `${leaveUser?.firstName || 'Unknown'} ${leaveUser?.lastName || ''}`,
          startDate: leave.start_date,
          endDate: leave.end_date,
          leaveType: leave.leave_type,
          status: leave.status,
          reason: leave.reason,
          approverComments: leave.approver_comments,
          daysCount: parseFloat(leave.days_count.toString()),
          createdAt: leave.created_at,
        };
      })
    );

    return NextResponse.json(leaveWithNames);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { leave_type, start_date, end_date, reason } = await request.json();

    if (!leave_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Leave type, start date, and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = await db.insert(leaves).values({
      user_id: auth.user!.id,
      leave_type,
      start_date,
      end_date,
      days_count: daysCount.toString(),
      reason,
      status: 'pending',
    }).returning();

    if (newLeave && newLeave.length > 0) {
      await createLeaveNotification(auth.user!.id, newLeave[0].id, 'applied');
    }

    return NextResponse.json({
      message: 'Leave request submitted successfully',
      leave: newLeave,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
