import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payrolls, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateRequest, requireHR } from '@/lib/rbac';
import { createPayrollNotification } from '@/lib/notifications';

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

    const allPayrolls = await db
      .select({
        id: payrolls.id,
        userId: payrolls.user_id,
        payPeriodStart: payrolls.pay_period_start,
        payPeriodEnd: payrolls.pay_period_end,
        grossSalary: payrolls.gross_salary,
        totalDeductions: payrolls.total_deductions,
        netSalary: payrolls.net_salary,
        payableDays: payrolls.payable_days,
        payslipUrl: payrolls.payslip_url,
        createdAt: payrolls.created_at,
        user: {
          firstName: users.first_name,
          lastName: users.last_name,
          email: users.email,
          employeeId: users.employee_id,
        }
      })
      .from(payrolls)
      .leftJoin(users, eq(payrolls.user_id, users.id))
      .orderBy(desc(payrolls.pay_period_start));

    return NextResponse.json(allPayrolls);
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

    const roleCheck = requireHR(auth.user!);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
      );
    }

    const body = await request.json();
    const { userId, payPeriodStart, payPeriodEnd, grossSalary, totalDeductions, netSalary, payableDays } = body;

    if (!userId || !payPeriodStart || !payPeriodEnd || !grossSalary || !totalDeductions || !netSalary || !payableDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create payroll record
    const newPayroll = await db
      .insert(payrolls)
      .values({
        user_id: userId,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        gross_salary: grossSalary.toString(),
        total_deductions: totalDeductions.toString(),
        net_salary: netSalary.toString(),
        payable_days: parseInt(payableDays),
        generated_by: auth.user!.id,
      })
      .returning();

    // Create notification for employee
    let toastData = null;
    if (newPayroll.length > 0) {
      toastData = await createPayrollNotification(userId, newPayroll[0].id);
    }

    return NextResponse.json({
      payroll: newPayroll[0],
      toast: toastData
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
