import { db } from '@/lib/db';
import { notifications, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createLeaveNotification(userId: string, leaveId: string, status: 'applied' | 'approved' | 'rejected', employeeName?: string) {
  // For leave applied, notify HR users
  // For leave approved/rejected, notify the employee
  let targetUsers: string[];
  let title: string;
  let message: string;
  let link: string;

  if (status === 'applied') {
    // Notify HR users
    const hrUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'hr'));
    
    targetUsers = hrUsers.map(hr => hr.id);
    title = 'New Leave Application';
    message = `${employeeName || 'An employee'} has applied for leave`;
    link = `/leave/approvals`;
  } else {
    // Notify the employee
    targetUsers = [userId];
    title = `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    message = `Your leave request has been ${status}`;
    link = `/leave`;
  }

  const notificationData = targetUsers.map(targetUserId => ({
    user_id: targetUserId,
    title,
    message,
    type: 'leave_status' as const,
    link,
    created_at: new Date(),
    is_read: false,
    payload: {
      leaveId,
      status,
      employeeName
    }
  }));

  if (notificationData.length > 0) {
    await db.insert(notifications).values(notificationData);
  }

  // Return toast notification data for the employee
  if (status !== 'applied') {
    return {
      userId,
      title,
      message,
      type: status === 'approved' ? 'success' : 'error'
    };
  }
}

export async function createPayrollNotification(userId: string, payrollId: string) {
  const notification = {
    user_id: userId,
    title: 'Payroll Published',
    message: 'Your payroll has been published and is now available',
    type: 'payroll_published' as const,
    link: '/payroll',
    created_at: new Date(),
    is_read: false,
    payload: {
      payrollId
    }
  };

  await db.insert(notifications).values(notification);

  // Return toast notification data
  return {
    userId,
    title: 'Payroll Published',
    message: 'Your payroll has been published and is now available for viewing.',
    type: 'success'
  };
}

export async function createApprovalNotification(userId: string, entityType: string, action: string) {
  const hrUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'hr'));

  const notificationData = hrUsers.map(hr => ({
    user_id: hr.id,
    title: `${entityType} Approval Required`,
    message: `A new ${entityType} requires your approval`,
    type: 'approval_request' as const,
    created_at: new Date(),
    is_read: false,
  }));

  if (notificationData.length > 0) {
    await db.insert(notifications).values(notificationData);
  }
}
