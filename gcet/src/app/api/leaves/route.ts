import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leaves, users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

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

    const [currentUser] = await db.select({
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let leaveRecords;
    
    if (currentUser.role === 'employee') {
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
      }).from(leaves).where(eq(leaves.user_id, payload.userId)).orderBy(desc(leaves.created_at));
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

    // Get user names for all leave records
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
    console.error('Get leaves error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { leave_type, start_date, end_date, reason } = await request.json();

    if (!leave_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Leave type, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Calculate days count
    const start = new Date(start_date);
    const end = new Date(end_date);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const [newLeave] = await db.insert(leaves).values({
      user_id: payload.userId,
      leave_type,
      start_date,
      end_date,
      days_count: daysCount.toString(),
      reason,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      message: 'Leave request submitted successfully',
      leave: newLeave,
    });

  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
