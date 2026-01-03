import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { authenticateRequest, requireHR } from '@/lib/rbac';
import { eq, and, ne } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const roleCheck = requireHR(auth.user!);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
      );
    }

    const allUsers = await db.select({
      id: users.id,
      firstName: users.first_name,
      lastName: users.last_name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      jobTitle: users.job_title,
      department: users.department,
      employeeId: users.employee_id,
      profilePictureUrl: users.profile_picture_url,
      isActive: users.is_active,
      createdAt: users.created_at,
    }).from(users).where(and(eq(users.is_active, true), ne(users.id, auth.user!.id)));

    const employeesWithStatus = allUsers.map(user => ({
      ...user,
      status: 'present' as const,
    }));

    return NextResponse.json(employeesWithStatus);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
