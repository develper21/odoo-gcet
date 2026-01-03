'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Trash2, Calendar, User } from 'lucide-react';

interface Document {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentListProps {
  userId?: string;
  canDelete?: boolean;
  refreshTrigger?: number;
}

export default function DocumentList({ userId, canDelete = false, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url = userId ? `/api/uploads?userId=${userId}` : '/api/uploads';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId, refreshTrigger]);

  const handleDownload = (document: Document) => {
    const link = window.document.createElement('a') as HTMLAnchorElement;
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleView = (document: Document) => {
    window.open(document.fileUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (document: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/uploads/${document.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Document Deleted',
            message: 'The document has been successfully deleted.',
            type: 'success'
          }
        }));
        
        // Refresh documents list
        fetchDocuments();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Document delete error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Delete Failed',
          message: 'Failed to delete document. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDocuments}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(document.fileType)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {document.fileName}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(document.uploadedAt)}</span>
                  </div>
                  {document.uploadedBy && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>
                        {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleView(document)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="View document"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleDownload(document)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </button>
              
              {canDelete && (
                <button
                  onClick={() => handleDelete(document)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
