import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users, notifications } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const [currentUser] = await db.select({
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { approver_comments } = await request.json();

    const [leave] = await db.select()
      .from(leaves)
      .where(eq(leaves.id, params.id))
      .limit(1);

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (leave.status !== 'pending') {
      return NextResponse.json(
        { error: 'Leave request already processed' },
        { status: 400 }
      );
    }

    // Update leave status
    const [updatedLeave] = await db.update(leaves)
      .set({
        status: 'rejected',
        approver_id: payload.userId,
        approver_comments,
        updated_at: new Date(),
      })
      .where(eq(leaves.id, params.id))
      .returning();

    // Create notification for employee
    await db.insert(notifications).values({
      user_id: leave.user_id,
      type: 'leave_status',
      title: 'Leave Rejected',
      message: `Your leave from ${leave.start_date} to ${leave.end_date} has been rejected by ${currentUser.firstName} ${currentUser.lastName}.`,
      link: '/leave',
      payload: {
        leaveId: leave.id,
        action: 'rejected',
        approver: `${currentUser.firstName} ${currentUser.lastName}`,
      },
      created_at: new Date(),
    });

    // Return notification data for toast
    const notificationData = {
      userId: leave.user_id,
      title: 'Leave Rejected',
      message: `Your leave from ${leave.start_date} to ${leave.end_date} has been rejected.`,
      type: 'error'
    };

    return NextResponse.json({
      message: 'Leave rejected successfully',
      leave: updatedLeave,
      toast: notificationData
    });

  } catch (error) {
    console.error('Reject leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
