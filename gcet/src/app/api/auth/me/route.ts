import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
      phone: users.phone,
      address: users.address,
      jobTitle: users.job_title,
      department: users.department,
      managerId: users.manager_id,
      profilePictureUrl: users.profile_picture_url,
      employeeId: users.employee_id,
      isActive: users.is_active,
      emailVerifiedAt: users.email_verified_at,
      createdAt: users.created_at,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
