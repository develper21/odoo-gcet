import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications, users, leaves, payrolls } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthCookie, verifyToken } from '@/lib/auth';

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

    const userNotifications = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        isRead: notifications.is_read,
        createdAt: notifications.created_at,
      })
      .from(notifications)
      .where(eq(notifications.user_id, payload.userId))
      .orderBy(desc(notifications.created_at));

    return NextResponse.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
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

    const body = await request.json();
    const { userId, title, message, type } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNotification = await db
      .insert(notifications)
      .values({
        user_id: userId,
        title,
        message,
        type,
        created_at: new Date(),
        is_read: false,
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
