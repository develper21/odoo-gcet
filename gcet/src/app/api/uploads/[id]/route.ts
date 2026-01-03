import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employee_documents } from '@/lib/db/schema';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
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

    const documentId = params.id;

    // First, get the document to check permissions and get file path
    const document = await db
      .select()
      .from(employee_documents)
      .where(eq(employee_documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const doc = document[0];

    // Check if user has permission to delete this document
    // Users can delete their own documents, admins/HR can delete any document
    if (doc.user_id !== payload.userId && payload.role !== 'admin' && payload.role !== 'hr') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete file from local storage
    if (doc.file_url) {
      try {
        const filePath = join(process.cwd(), 'public', doc.file_url);
        await unlink(filePath);
      } catch (error) {
        // File might not exist, continue with database deletion
        console.warn('File not found for deletion:', doc.file_url);
      }
    }

    // Delete document from database
    await db
      .delete(employee_documents)
      .where(eq(employee_documents.id, documentId));

    return NextResponse.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
