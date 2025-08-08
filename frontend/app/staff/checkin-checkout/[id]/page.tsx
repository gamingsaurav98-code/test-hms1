'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { staffCheckInCheckOutApi, StaffCheckInCheckOut } from '@/lib/api/staff-checkincheckout.api';
import { Button } from '@/components/ui';
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  ArrowRight,
  Calendar,
  User,
  Home
} from 'lucide-react';

export default function StaffCheckinCheckoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<StaffCheckInCheckOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await staffCheckInCheckOutApi.getMyRecord(recordId);
      setRecord(response.data);
    } catch (err: any) {
      console.error('Failed to fetch record:', err);
      setError(err.message || 'Failed to load record details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!record) return;
    
    try {
      setCheckingIn(true);
      setError(null);
      
      // Use current date and time for check-in
      const now = new Date();
      
      await staffCheckInCheckOutApi.checkIn({
        block_id: String(record.block?.id || ''),
        remarks: `Checked in from detail page at ${now.toLocaleString()}`
      });
      
      setSuccessMessage(`Successfully checked in at ${now.toLocaleString()}!`);
      
      // Refresh the record to get updated data
      await fetchRecord();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to check in:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const getStatusBadge = () => {
    if (!record) return null;
    
    switch (record.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <Check className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <X className="w-4 h-4 mr-2" />
            Declined
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowRight className="w-4 h-4 mr-2" />
            Checked In
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            Unknown Status
          </span>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!record || !record.checkout_time) {
      return 'N/A';
    }
    
    // If staff has checked in, calculate duration between checkout and checkin
    if (record.checkin_time) {
      const checkoutTime = new Date(record.checkout_time);
      const checkinTime = new Date(record.checkin_time);
      const diffMs = checkinTime.getTime() - checkoutTime.getTime();
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    
    // If not checked in yet, calculate duration between checkout and estimated return
    if (record.estimated_checkin_date) {
      const checkoutTime = new Date(record.checkout_time);
      const estimatedReturn = new Date(record.estimated_checkin_date);
      const diffMs = estimatedReturn.getTime() - checkoutTime.getTime();
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h (estimated)`;
      } else if (hours > 0) {
        return `${hours}h (estimated)`;
      }
      return 'Less than 1 hour (estimated)';
    }
    
    return 'N/A';
  };

  const getCheckoutReason = () => {
    if (!record || !record.remarks) return '';
    
    // Extract only the original checkout reason, exclude check-in information
    const remarks = record.remarks;
    
    // Split by ". Check-in:" to separate original reason from check-in timestamp
    const parts = remarks.split('. Check-in:');
    return parts[0]; // Return only the original checkout reason
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Check-in/Checkout
          </button>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Record Not Found</h3>
              <p className="text-gray-600 mb-4">{error || 'The requested record could not be found.'}</p>
              <Button
                onClick={() => router.push('/staff/checkin-checkout')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Check-in/Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Check-in/Checkout Details</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Created: {formatDateTime(record.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              {record.status === 'approved' && !record.checkin_time && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Check In"
                >
                  {checkingIn ? (
                    <>
                      <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking In...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-1.5" />
                      Check In
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Time Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.checkout_time && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <ArrowLeft className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-sm font-medium text-orange-900">Checkout Time</p>
                  </div>
                  <p className="text-lg font-semibold text-orange-800 ml-11">{formatDateTime(record.checkout_time)}</p>
                </div>
              )}

              {record.checkin_time && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-900">Check-in Time</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-800 ml-11">{formatDateTime(record.checkin_time)}</p>
                </div>
              )}

              {record.estimated_checkin_date && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-900">Estimated Return</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-800 ml-11">{formatDate(record.estimated_checkin_date)}</p>
                </div>
              )}

              {/* Always show duration if checkout time exists */}
              {record.checkout_time && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {record.checkin_time ? 'Total Duration' : 'Expected Duration'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-11">{calculateDuration()}</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                {record.block && (
                  <div className="flex items-center text-gray-600">
                    <Home className="w-4 h-4 mr-1" />
                    <span className="font-medium">Block:</span>
                    <span className="ml-1">{record.block.block_name}</span>
                  </div>
                )}
                {record.checkout_duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-medium">Duration:</span>
                    <span className="ml-1">{record.checkout_duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          {record.remarks && getCheckoutReason() && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Reason
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">{getCheckoutReason()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
