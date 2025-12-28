"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { staffApi } from '@/lib/api/staff.api';
import { Complain } from '@/lib/api/complain.api';
import { ApiError } from '@/lib/api/core';
import { Button, ConfirmModal, TableSkeleton } from '@/components/ui';
import ChatInterface from '@/components/ui/ChatInterface';
import { 
  ArrowLeft, 
  AlertCircle,
  Check,
  X,
  Loader,
  Clock
} from 'lucide-react';

export default function StaffComplainDetail() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const complainId = params?.id as string;

  const [complain, setComplain] = useState<Complain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch complain data
  useEffect(() => {
    const fetchComplain = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const complainData = await staffApi.getStaffComplaint(complainId);
        setComplain(complainData);
        
      } catch (error) {
        console.error('Error fetching complain:', error);
        if (error instanceof ApiError) {
          if (error.status === 404) {
            setError(`Complaint with ID ${complainId} not found. It may have been deleted or the ID is incorrect.`);
          } else {
            setError(`Failed to load complaint: ${error.message}`);
          }
        } else {
          setError('Failed to load complaint data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (complainId) {
      fetchComplain();
    }
  }, [complainId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <Loader className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1";
    
    switch (status) {
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            {getStatusIcon(status)}
            Pending Review
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            {getStatusIcon(status)}
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            {getStatusIcon(status)}
            Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            {getStatusIcon(status)}
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {getStatusIcon(status)}
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="secondary"
              onClick={() => router.push('/staff/complain')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Complaints
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Complaint</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complain) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
              <p className="text-gray-600 mb-4">The requested complaint could not be found.</p>
              <Button onClick={() => router.push('/staff/complain')}>
                Back to Complaints
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{complain.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(complain.status)}
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{formatDate(complain.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Left Sidebar - Complaint Details */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200" style={{height: '550px'}}>
              {/* Info Section */}
              <div className="p-5 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Complain Details</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block flex items-center">
                      <svg className="w-3 h-3 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Title
                    </label>
                    <p className="text-base text-gray-900 leading-relaxed font-medium bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">{complain.title}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{complain.description}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center">
                      <svg className="w-3 h-3 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium block text-xs mb-1">Created</span>
                        <span className="text-gray-900 font-semibold text-xs">{formatDate(complain.created_at)}</span>
                      </div>
                      {complain.updated_at && (
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium block text-xs mb-1">Updated</span>
                          <span className="text-gray-900 font-semibold text-xs">{formatDate(complain.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Area - Chat Interface */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden" style={{height: '550px'}}>
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Chat Messages</h3>
                    <p className="text-xs text-gray-600 mt-1">Communicate directly with the administration about this complaint</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatInterface
                  complainId={complain.id}
                  currentUserId={user?.id || 0}
                  currentUserType="staff"
                  currentUserName={user?.name || 'Staff Member'}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
