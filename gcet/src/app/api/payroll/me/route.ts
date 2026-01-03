import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payrolls } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateRequest, requireEmployee } from '@/lib/rbac';

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

    const userPayrolls = await db
      .select({
        id: payrolls.id,
        payPeriodStart: payrolls.pay_period_start,
        payPeriodEnd: payrolls.pay_period_end,
        grossSalary: payrolls.gross_salary,
        totalDeductions: payrolls.total_deductions,
        netSalary: payrolls.net_salary,
        payableDays: payrolls.payable_days,
        payslipUrl: payrolls.payslip_url,
        createdAt: payrolls.created_at,
      })
      .from(payrolls)
      .where(eq(payrolls.user_id, auth.user!.id))
      .orderBy(desc(payrolls.pay_period_start));

    return NextResponse.json(userPayrolls);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
