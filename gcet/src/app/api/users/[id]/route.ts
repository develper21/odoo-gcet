import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, salary_structures } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
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
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only view their own profile unless they are admin/hr
    if (payload.userId !== params.id && currentUser.role === 'employee') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const [user] = await db.select({
      id: users.id,
      firstName: users.first_name,
      lastName: users.last_name,
      email: users.email,
      phone: users.phone,
      address: users.address,
      jobTitle: users.job_title,
      department: users.department,
      employeeId: users.employee_id,
      profilePictureUrl: users.profile_picture_url,
      dateOfBirth: users.email_verified_at, // Placeholder - would need date_of_birth field
      gender: users.role, // Placeholder - would need gender field
      maritalStatus: users.role, // Placeholder - would need marital_status field
      dateOfJoining: users.created_at,
      nationality: users.role, // Placeholder - would need nationality field
      personalEmail: users.email, // Placeholder - would need personal_email field
    }).from(users).where(eq(users.id, params.id)).limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get salary structure if user has permission
    let salaryStructure = null;
    if (currentUser.role === 'admin' || currentUser.role === 'hr' || payload.userId === params.id) {
      const [salary] = await db.select().from(salary_structures)
        .where(eq(salary_structures.user_id, params.id)).limit(1);
      
      if (salary) {
        salaryStructure = {
          baseSalary: parseFloat(salary.base_salary.toString()),
          basicPercentage: parseFloat(salary.basic_percentage.toString()),
          hraPercentage: parseFloat(salary.hra_percentage.toString()),
          standardAllowance: parseFloat(salary.standard_allowance.toString()),
          performanceBonusPercentage: parseFloat(salary.performance_bonus_percentage.toString()),
          ltaPercentage: parseFloat(salary.lta_percentage.toString()),
          pfEmployeeRate: parseFloat(salary.pf_employee_rate.toString()),
          pfEmployerRate: parseFloat(salary.pf_employer_rate.toString()),
          professionalTax: parseFloat(salary.professional_tax.toString()),
        };
      }
    }

    const userProfile = {
      ...user,
      salaryStructure,
      bankDetails: {
        accountNumber: '**** **** **** 1234',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        panNumber: 'ABCDE1234F',
        uanNumber: '123456789012',
        empCode: user.employeeId || 'EMP001',
      },
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
