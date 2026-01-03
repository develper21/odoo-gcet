import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { employee_documents, users } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and, ne } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Save file to local storage
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Save file info to database (only for non-logo uploads)
    const fileUrl = `/uploads/${uniqueFileName}`;
    let newDocument = null;

    if (fileType !== 'company_logo') {
      newDocument = await db
        .insert(employee_documents)
        .values({
          user_id: payload.userId,
          file_url: fileUrl,
          file_type: fileType || 'document',
          file_name: fileName || file.name,
          uploaded_by: payload.userId,
          uploaded_at: new Date(),
        })
        .returning();
    }

    // If this is a profile picture, update user's profile_picture_url
    if (fileType === 'profile_picture') {
      await db
        .update(users)
        .set({ profile_picture_url: fileUrl })
        .where(eq(users.id, payload.userId));
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      document: newDocument?.[0] || null,
      fileUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || payload.userId;

    // Check if user has permission to view these documents
    if (userId !== payload.userId && payload.role !== 'admin' && payload.role !== 'hr') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const documents = await db
      .select({
        id: employee_documents.id,
        fileUrl: employee_documents.file_url,
        fileType: employee_documents.file_type,
        fileName: employee_documents.file_name,
        uploadedAt: employee_documents.uploaded_at,
        uploadedBy: {
          firstName: users.first_name,
          lastName: users.last_name,
        },
      })
      .from(employee_documents)
      .leftJoin(users, eq(employee_documents.uploaded_by, users.id))
      .where(and(eq(employee_documents.user_id, userId), ne(employee_documents.file_type, 'company_logo')))
      .orderBy(employee_documents.uploaded_at);

    return NextResponse.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
