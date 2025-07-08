"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { noticeApi, Notice } from '@/lib/api';
import { Button, ImageModal } from '@/components/ui';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Calendar, 
  User,
  Clock, 
  File,
  AlertCircle,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function NoticeDetail() {
  const router = useRouter();
  const { id } = useParams();
  const noticeId = Array.isArray(id) ? id[0] : id || '';
  
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', alt: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Get the API base URL for file paths
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '');

  // Fetch notice data
  useEffect(() => {
    if (!noticeId) {
      setError('Notice ID is missing');
      setIsLoading(false);
      return;
    }
    
    const fetchNotice = async () => {
      try {
        const data = await noticeApi.getNotice(noticeId);
        setNotice(data);
      } catch (err) {
        setError('Failed to load notice details');
        console.error('Error fetching notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await noticeApi.deleteNotice(noticeId);
      router.push('/admin/notice');
    } catch (err) {
      console.error('Error deleting notice:', err);
      setError('Failed to delete notice');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleAttachmentClick = (url: string, name: string) => {
    // For all file types, show in the modal
    setSelectedImage({ url, alt: name });
    setImageModalOpen(true);
  };

  // Function to get file type icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return (
          <div className="bg-red-100 rounded p-1">
            <File className="h-4 w-4 text-red-600" />
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="bg-blue-100 rounded p-1">
            <File className="h-4 w-4 text-blue-600" />
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="bg-green-100 rounded p-1">
            <File className="h-4 w-4 text-green-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded p-1">
            <File className="h-4 w-4 text-gray-600" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center text-red-700 mb-4">
            <AlertCircle className="w-6 h-6 mr-2" />
            <h2 className="text-lg font-semibold">Error</h2>
          </div>
          <p className="text-red-600">{error || 'Notice not found'}</p>
          <Button className="mt-6" onClick={() => router.push('/admin/notice')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notice Details</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/admin/notice/${noticeId}/edit`)}
                variant="primary"
              >
                Edit Notice
              </Button>
              <Button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                variant="danger"
                loading={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Notice Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-medium text-gray-900">{notice.title}</h2>
              <div className="flex items-center">
                {notice.status === 'active' ? (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Active
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                    <X className="h-3.5 w-3.5 mr-1" />
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notice Content */}
          <div className="p-6">
            {/* Notice Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Scheduled:</span> 
                {formatDate(notice.schedule_time)}
              </div>
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Target:</span>
                {notice.target_type === 'all' ? 'Everyone' : 
                 notice.target_type === 'student' ? 'All Students' : 
                 notice.target_type === 'staff' ? 'All Staff' : 
                 notice.target_type === 'specific_student' ? 'Specific Student' : 
                 notice.target_type === 'specific_staff' ? 'Specific Staff' : 
                 notice.target_type === 'block' ? 'Specific Block' : notice.target_type}
              </div>
              <div className="flex items-center text-gray-600">
                <File className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Type:</span>
                {notice.notice_type ? notice.notice_type.charAt(0).toUpperCase() + notice.notice_type.slice(1) : 'N/A'}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Created:</span>
                {formatDate(notice.created_at)}
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6 border-t border-gray-100 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                {notice.description}
              </div>
            </div>

            {/* Attachments */}
            {notice.attachments && notice.attachments.length > 0 && (
              <div className="mb-4 border-t border-gray-100 pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notice.attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      {getFileIcon(attachment.name)}
                      <div 
                        className="ml-3 flex-grow truncate cursor-pointer"
                        onClick={() => handleAttachmentClick(attachment.path, attachment.name)}
                      >
                        <div className="text-sm font-medium text-gray-700 truncate">{attachment.name}</div>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button 
                          className="p-1 rounded hover:bg-blue-100" 
                          title="View"
                          onClick={() => handleAttachmentClick(attachment.path, attachment.name)}
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </button>
                        <a 
                          href={`${apiBaseUrl}/storage/${attachment.path}`} 
                          download={attachment.name}
                          className="p-1 rounded hover:bg-green-100" 
                          title="Download"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this notice? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        show={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage.url}
        alt={selectedImage.alt}
      />
    </div>
  );
}
