import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and, ne } from 'drizzle-orm';

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
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
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
    }).from(users).where(and(eq(users.is_active, true), ne(users.id, payload.userId)));

    const employeesWithStatus = allUsers.map(user => ({
      ...user,
      status: 'present' as const, // This would be calculated based on attendance
    }));

    return NextResponse.json(employeesWithStatus);

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
