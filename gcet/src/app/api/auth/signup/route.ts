import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, validatePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { generateUniqueEmployeeId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, role = 'employee' } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters' },
        { status: 400 }
      );
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    // Generate employee_id only for role='employee'
    let employeeId = null;
    if (role === 'employee') {
      employeeId = await generateUniqueEmployeeId();
    }

    const [newUser] = await db.insert(users).values({
      email,
      password_hash: hashedPassword,
      role,
      first_name: firstName,
      last_name: lastName,
      phone,
      employee_id: employeeId,
      is_active: true,
    }).returning();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        employeeId: newUser.employee_id,
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
