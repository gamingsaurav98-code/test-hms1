"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inquiryApi, Inquiry, ApiError } from '@/lib/api/index';
import { TableSkeleton, Button, ConfirmModal } from '@/components/ui';

export default function InquiryDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await inquiryApi.deleteInquiry(id);
      
      // Redirect to inquiries list after successful deletion
      router.push('/admin/inquiry');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      if (error instanceof ApiError) {
        setError(`Failed to delete inquiry: ${error.message}`);
      } else {
        setError('Failed to delete inquiry. Please try again.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching inquiry with ID:', id);
        const data = await inquiryApi.getInquiry(id);
        console.log('Received inquiry data:', data);
        setInquiry(data);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        if (error instanceof ApiError) {
          setError(`Failed to fetch inquiry: ${error.message}`);
        } else {
          setError('Failed to fetch inquiry data. Please try refreshing the page.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Inquiry Details</h1>
          <p className="text-sm text-gray-500 mt-1">Loading inquiry data...</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error || 'Inquiry not found'}</p>
          </div>
          <div className="mt-3 space-x-2">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="sm"
            >
              Retry
            </Button>
            <Button
              onClick={() => router.push('/admin/inquiry')}
              variant="ghost"
              size="sm"
            >
              Back to Inquiries
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
        isLoading={isDeleting}
        variant="danger"
      />

      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{inquiry.name || 'Inquiry Details'}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Viewing inquiry details
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/admin/inquiry/${id}/edit`)}
                variant="primary"
              >
                Edit Inquiry
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

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Main Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Inquiry Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Student Name</h4>
                  <p className="text-lg text-gray-900">{inquiry.name || 'Not provided'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email Address</h4>
                  <p className="text-lg text-gray-900">{inquiry.email || 'Not provided'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h4>
                  <p className="text-lg text-gray-900">{inquiry.phone || 'Not provided'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Number of Seaters</h4>
                  <p className="text-lg text-gray-900">
                    {inquiry.seater_type ? `${inquiry.seater_type}-seater` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 mt-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">{formatDate(inquiry.created_at)}</span>
                </div>
                {inquiry.updated_at && (
                  <div>
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">{formatDate(inquiry.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
