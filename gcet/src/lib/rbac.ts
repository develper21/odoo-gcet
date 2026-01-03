import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}> {
  try {
    const token = await getAuthCookie();
    
    if (!token) {
      return { error: 'No authentication token found', status: 401 };
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return { error: 'Invalid token', status: 401 };
    }

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.first_name,
      lastName: users.last_name,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    return { user };
  } catch (error) {
    return { error: 'Authentication failed', status: 500 };
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: AuthenticatedUser): { error?: string; status?: number } => {
    if (!allowedRoles.includes(user.role)) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    return {};
  };
}

export const requireHR = requireRole(['hr', 'admin']);
export const requireAdmin = requireRole(['admin']);
export const requireEmployee = requireRole(['employee', 'hr', 'admin']);
